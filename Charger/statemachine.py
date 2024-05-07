from stmpy import Machine, Driver, get_graphviz_dot
import time
from threading import Thread
import paho.mqtt.client as mqtt
import threading
import json
from demo_opts import get_device
from luma.core.render import canvas
import RPi.GPIO as GPIO
from mfrc522 import SimpleMFRC522
import random

reader = SimpleMFRC522()

device = get_device()
charger_server_topic = "/group-13/charger_server"
server_client_topic = "/group-13/server_client"

broker, port = "test.mosquitto.org", 1883

class MQTT_Client_1:
    def __init__(self):
        self.count = 0
        self.client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION1)
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message    

    def on_connect(self, client, userdata, flags, rc):
        print("on_connect(): {}".format(mqtt.connack_string(rc)))

    def on_message(self, client, userdata, msg):
        message_str = msg.payload

        message = json.loads(message_str)
        if message["message_to"] == "charger":
            if message["trigger"] == "licence_detected":
                msg=json.dumps({"message_to":"server",
                                "trigger":"licence_received",
                                "car_id": "",
                                "plate_number": message["plate_number"],
                                "current_charge": ""})
                self.client.publish(charger_server_topic, msg)
                time.sleep(1)
            self.stm_driver.send(message["trigger"], "charger")



    def start(self, broker, port):

        print("Connecting to {}:{}".format(broker, port))
        self.client.connect(broker, port)

        self.client.subscribe(charger_server_topic)

        try:
            thread = Thread(target=self.client.loop_forever)
            thread.start()
        except KeyboardInterrupt:
            print("Interrupted")
            self.client.disconnect()

class Charger:
    def plug_in(self):
        while True:
            BUTTON_PIN = 37
            GPIO.setmode(GPIO.BOARD)
            GPIO.setup(BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)
            if GPIO.input(BUTTON_PIN) == GPIO.LOW:
                if not self.plugged: #only send mqtt if we were prevoiusly unplugged
                    self.plugged = True       
                    msg=json.dumps({"message_to":"charger",
                                    "trigger":"car_plugged_in",
                                    "car_id": "",
                                    "plate_number": "",
                                    "current_charge": ""})
                    self.mqtt_client.publish(charger_server_topic, msg)
            else:
                if self.plugged: #only send mqtt if we were prevoiusly plugged
                    self.plugged = False
                    time.sleep(1) # In case we are charging, we must wait for start_charge() to finish
                    msg=json.dumps({"message_to":"charger",
                                    "trigger":"car_unplugged",
                                    "car_id": "",
                                    "plate_number": "",
                                    "current_charge": ""})
                    self.mqtt_client.publish(charger_server_topic, msg)
            time.sleep(0.5)

    def buttons(self):
        while True:
            BUTTON_PIN = 36
            GPIO.setmode(GPIO.BOARD)
            GPIO.setup(BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)
            if GPIO.input(BUTTON_PIN) == GPIO.LOW:
                print("Button")
                self.button_press = True
                msg=json.dumps({"message_to":"charger",
                                "trigger":"button",
                                "car_id": "",
                                "plate_number": "",
                                "current_charge": ""})
                self.mqtt_client.publish(charger_server_topic, msg)
                time.sleep(2) #in order to hinder double press
            time.sleep(0.2)

    def read(self):
        while True:
            if self.reading:
                try:
                    id, text = reader.read()
                    print(id, text)
                    msg=json.dumps({"message_to":"charger",
                                    "trigger":"tag_detected",
                                    "car_id": id,
                                    "plate_number":text[:7],
                                    "current_charge": ""})
                    self.mqtt_client.publish(charger_server_topic, msg)
                    msg=json.dumps({"message_to":"server",
                                    "trigger":"tag_received",
                                    "car_id": id,
                                    "plate_number":text[:7],
                                    "current_charge": ""})
                    self.mqtt_client.publish(charger_server_topic, msg)
                finally:
                    GPIO.cleanup()
            time.sleep(1)

    def drawText(self):
        while True:
            if self.display_text_l1 == "100%":
                time.sleep(0.5)
                msg=json.dumps({"message_to":"charger",
                                "trigger":"charge_complete",
                                "car_id": "",
                                "plate_number":"",
                                "current_charge": ""})
                self.mqtt_client.publish(charger_server_topic, msg)
            with canvas(device) as draw:
                draw.text((20, 5), self.display_text_l1, fill="white")
                draw.text((20, 20), self.display_text_l2, fill="white")
                draw.text((20, 35), self.display_text_l3, fill="white")
            time.sleep(0.1)
    
    def __init__(self):
        self.display_text_l1 = "Welcome,"
        self.display_text_l2 = "please connect"
        self.display_text_l3 = "your car."
        t1 = threading.Thread(target=self.drawText)
        t1.start()
        self.plugged = True
        t2 = threading.Thread(target=self.buttons)
        t2.start()
        self.reading = False
        self.button_press = False
        read_thread = threading.Thread(target=self.read)
        read_thread.start()
        t3 = threading.Thread(target=self.plug_in)
        t3.start()
        self.licence = ""

    #Server functions
    def connect_to_server(self):
        msg=json.dumps({"message_to":"server",
                        "trigger":"charger_connected",
                        "car_id": "",
                        "plate_number": "",
                        "current_charge": ""})
        self.mqtt_client.publish(charger_server_topic, msg)
        print('Connected to server')

    def disconnect_from_server(self):
        msg=json.dumps({"message_to":"server",
                        "trigger":"charger_disconnected",
                        "car_id": "",
                        "plate_number": "",
                        "current_charge": ""})
        self.mqtt_client.publish(charger_server_topic, msg)
        print('Disconnecting from server')

    def send_complete(self, r):
        msg=json.dumps({"message_to":"server",
                        "trigger":"charge_complete",
                        "car_id": "",
                        "plate_number": "",
                        "current_charge": "",
                        "starting_charge_percentage" : r})
        self.mqtt_client.publish(charger_server_topic, msg)
        print("Sending complete to server")
    
#Check functions
    def check_app(self):
        msg=json.dumps({"message_to":"server",
                        "car_id": "",
                        "plate_number": "",
                        "current_charge": ""})
        self.mqtt_client.publish(charger_server_topic, msg) # remove this when the app is working
        print('Checking app')
    
    
#Charge functions 
    def start_charge(self):

        print('Starting charge')
        r = random.randint(70, 90)

        for i in range(r,101):
            if not self.plugged:
                self.stop_charge()
                break
            time.sleep(0.5)
            self.display_text_l1 = str(i)+"%"
            self.display_text_l2 = ""
            self.display_text_l3 = ""
            msg=json.dumps({"message_to":"server",
                        "trigger":"",
                        "car_id": "",
                        "plate_number": "",
                        "current_charge": i})
            self.mqtt_client.publish(charger_server_topic, msg)
            print(str(i)+"%")

            if i == 100:
                self.send_complete(r)

    def stop_charge(self):
        print('Stopping charge')
        self.display_text_l1 = 'Stopping charge'
        self.display_text_l2 = "..."
        self.display_text_l3 = "Issuing Payment"
        time.sleep(3)
    
#Display functions
    def display_charge(self):
        self.display_text_l1 = "Displaying charge"
        self.display_text_l2 = ''
        self.display_text_l3 = "..."
        time.sleep(0.5)
        print('Displaying charge')
        
    def display_tag_check(self):
        self.reading = True
        self.button_press = False
        self.display_text_l1 = "Checking tag, if"
        self.display_text_l2 = "nothing happens,"
        self.display_text_l3 = "press button"
        print("Checking tag, if nothing happens, press button")
        
    def display_camera_check(self):
        self.reading = False
        self.button_press = False
        print("Checking camera, if nothing happens, press button")
        self.display_text_l1 = "" #smoother transition to show that we changed the display text to camera instead of tag
        self.display_text_l2 = ""
        self.display_text_l3 = ""
        time.sleep(0.1)
        self.display_text_l1 = "Checking camera, if"
        self.display_text_l2 = "nothing happens,"
        self.display_text_l3 = "press button"

        
    def display_connect_with_app(self):
        self.button_press = False
        print("Please connect through app")
        self.display_text_l1 = "" #smoother transition to show that we changed the display text to camera instead of tag
        self.display_text_l2 = ""
        self.display_text_l3 = ""
        time.sleep(0.1)
        msg=json.dumps({"message_to":"server",
                        "trigger":"app_request",
                        "car_id": "",
                        "plate_number": "",
                        "current_charge": ""})
        self.mqtt_client.publish(charger_server_topic, msg)
        self.display_text_l1 = "Checking app, if"
        self.display_text_l2 = "nothing happens,"
        self.display_text_l3 = "press button"


    def display_waiting_for_payment(self):
        self.reading = False
        print("Checking info")
        self.display_text_l1 = 'Checking info'
        self.display_text_l2 = ""
        self.display_text_l3 = "..."

        
    def display_complete(self):
        print('Display completed')
        self.display_text_l1 = 'Charge complete'
        self.display_text_l2 = "Please disconnect"
        self.display_text_l3 = "your car."

        
    def stop_display(self):
        print('Stopping display')
        self.display_text_l1 = "Welcome,"
        self.display_text_l2 = "please connect"
        self.display_text_l3 = "your car."

        
    def display_error_message(self):
        msg=json.dumps({"message_to":"server",
                        "trigger":"identification_failed",
                        "car_id": "",
                        "plate_number": "",
                        "current_charge": ""})
        self.mqtt_client.publish(charger_server_topic, msg)
        print('Error')
        self.display_text_l1 = 'Error in '
        self.display_text_l2 = "identification."
        self.display_text_l3 = "Please disconnect."

        
charger = Charger()
        
# initial transition
t0 = {'source':'initial', 
      'target':'idle'}

#transitions from idle
t_idle_1 = {'trigger':'car_plugged_in',
      'source':'idle',
      'target':'tag_identify'}

#transitions from tag_identify
t_tag_1 = {'trigger':'tag_detected', 
      'source':'tag_identify', 
      'target':'server_validate'}

t_tag_2 = {'trigger':'button', 
      'source':'tag_identify', 
      'target':'licence_identify'}

t_tag_3 = {'trigger':'car_unplugged', 
      'source':'tag_identify', 
      'target':'idle'}

#transitions from licence_identify
t_camera_1 = {'trigger':'licence_detected', 
      'source':'licence_identify', 
      'target':'server_validate'}

t_camera_2 = {'trigger':'button', 
      'source':'licence_identify', 
      'target':'app_identify'}

t_camera_3 = {'trigger':'car_unplugged', 
      'source':'licence_identify', 
      'target':'idle'}

#transitions from server_validate
t_server_1 = {'trigger':'tag_info_rejected', 
      'source':'server_validate', 
      'target':'licence_identify'}

t_server_2 = {'trigger':'server_ok', 
      'source':'server_validate', 
      'target':'charging'}

t_server_3 = {'trigger':'licence_info_rejected', 
      'source':'server_validate', 
      'target':'app_identify'}

t_server_4 = {'trigger':'car_unplugged', 
      'source':'server_validate', 
      'target':'idle'}
#transitions from app_identify
t_app_1 = {'trigger':'app_start', 
      'source':'app_identify', 
      'target':'charging'}

t_app_2 = {'trigger':'button',
      'source':'app_identify',
      'target':'identification_failed'}

t_app_3 = {'trigger':'car_unplugged',
      'source':'app_identify',
      'target':'idle'}

#transitions from identification
t_identification = {'trigger':'car_unplugged',
      'source':'identification_failed',
      'target':'idle'}

#transitions from charging
t_charging_1 = {'trigger':'charge_complete',
      'source':'charging',
      'target':'charge_complete'}

t_charging_2 = {'trigger':'car_unplugged',
       'source':'charging',
       'target':'idle'}

#transitions from charge_complete
t_complete = {'trigger':'car_unplugged',
      'source':'charge_complete',
      'target':'idle'}

idle = {'name': 'idle',
        'entry': 'stop_display; disconnect_from_server',
        'exit': 'connect_to_server'}

tag_identify = {'name': 'tag_identify',
        'entry': 'display_tag_check;'}

licence_identify = {'name': 'licence_identify',
        'entry': 'display_camera_check;'}

server_validate = {'name': 'server_validate',
        'entry': 'display_waiting_for_payment'}

charging = {'name': 'charging',
        'entry': 'display_charge; start_charge'}

charge_complete = {'name': 'charge_complete',
        'entry': 'display_complete'}

app_identify = {'name': 'app_identify',
        'entry': 'display_connect_with_app;'}

identification_failed = {'name': 'identification_failed',
        'entry': 'display_error_message'}

states = [idle, tag_identify, licence_identify, server_validate, charging, charge_complete, app_identify, identification_failed]


# Change 4: We pass the set of states to the state machine
machine = Machine(name='charger', transitions=[t0, t_idle_1, t_tag_1, t_tag_2, t_tag_3, t_camera_1, t_camera_2, t_camera_3, t_server_1, t_server_2, t_server_3, t_server_4, t_app_1, t_app_2, t_app_3, t_identification, t_charging_1, t_charging_2, t_complete], obj=charger, states=states)
with open("graph.gv", "w") as file:
      print(get_graphviz_dot(machine), file=file)
charger.stm = machine

driver = Driver()
driver.add_machine(machine) 

myclient = MQTT_Client_1()
charger.mqtt_client = myclient.client
myclient.stm_driver = driver

driver.start()
myclient.start(broker, port)
