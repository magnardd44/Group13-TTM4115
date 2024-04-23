from stmpy import Machine, Driver, get_graphviz_dot

import time

from threading import Thread

import paho.mqtt.client as mqtt

topic = "/group-13/charger_server"
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
        message_str = msg.payload.decode('utf-8').strip()
        if message_str.startswith("server:"):
            print(message_str[7:])
            self.stm_driver.send(message_str[7:], "charger")


    def start(self, broker, port):

        print("Connecting to {}:{}".format(broker, port))
        self.client.connect(broker, port)

        self.client.subscribe(topic)

        try:
            # line below should not have the () after the function!
            thread = Thread(target=self.client.loop_forever)
            thread.start()
        except KeyboardInterrupt:
            print("Interrupted")
            self.client.disconnect()

class Charger:    
    def __init__(self):
        pass

    #Server functions
    def connect_to_server(self):
        self.mqtt_client.publish(topic, "charger:charger_connected")
        print('Connected to server')

    def disconnect_from_server(self):
        self.mqtt_client.publish(topic, "charger:charger_disconnected")
        print('Disconnecting from server')

    def send_complete(self):
        self.mqtt_client.publish(topic, "charger:charge_complete")
        print("Sending complete to server")
    
    #Check functions
    def check_camera(self):
        self.mqtt_client.publish(topic, "charger:licence_recieved")
        print('Checking camera')
        
    def check_tag(self):
        self.mqtt_client.publish(topic, "charger:tag_received")
        print('blablabala') 
      
    def check_app(self):
        self.mqtt_client.publish(topic, "charger:app_connected") # remove this when the app is working
        print('Checking app')
    
    
    #Charge functions
    def start_charge(self):
        print('Starting charge')
        for i in range(1,101):
            if not self.mqtt_client.plugged:
                break
            time.sleep(0.5)
            print(str(i)+"%")

    def stop_charge(self):
        print('Stopping charge')
    
    #Display functions
    def display_charge(self):
        print('Displaying charge')
        
    def display_tag_check(self):
        self.mqtt_client.publish(topic, "server:tag_detected")
        print("Checking tag, if nothing happens, press button")
        
    def display_camera_check(self):
        print("Checking camera, if nothing happens, press button")
        
    def display_connect_with_app(self):
        print("Please connect through app")

    def display_waiting_for_payment(self):
        print("Checking info")
        
    def display_complete(self):
        print('Display completed')
        
    def stop_display(self):
        print('Stopping display')
        
    def display_error_message(self):
        self.mqtt_client.publish(topic, "charger:identfication_failed")
        print('Error')

        
charger = Charger()
        
# initial transition
t0 = {'source':'initial', 
      'target':'idle'}

#transitions from idle
t_idle_1 = {'trigger':'car_plugged_in',
      'source':'idle',
      'effect':'connect_to_server; check_tag; display_tag_check',
      'target':'tag_identify'}

#transitions from tag_identify
t_tag_1 = {'trigger':'tag_detected', 
      'source':'tag_identify', 
      'effect':'display_waiting_for_payment',
      'target':'server_validate'}

t_tag_2 = {'trigger':'button', 
      'source':'tag_identify', 
      'effect':'check_camera; display_camera_check',
      'target':'camera_identify'}

t_tag_3 = {'trigger':'car_unplugged', 
      'source':'tag_identify', 
      'effect':'disconnect_from_server; stop_display',
      'target':'idle'}

#transitions from camera_identify
t_camera_1 = {'trigger':'licence_detected', 
      'source':'camera_identify', 
      'effect':'display_waiting_for_payment',
      'target':'server_validate'}

t_camera_2 = {'trigger':'button', 
      'source':'camera_identify', 
      'effect':'display_connect_with_app; start_timer("app_timer", 5000)',
      'target':'app_identify'}

t_camera_3 = {'trigger':'car_unplugged', 
      'source':'camera_identify', 
      'effect':'disconnect_from_server; stop_display',
      'target':'idle'}

#transitions from server_validate
t_server_1 = {'trigger':'tag_info_rejected', 
      'source':'server_validate', 
      'effect':'check_camera; display_camera_check',
      'target':'camera_identify'}

t_server_2 = {'trigger':'server_ok', 
      'source':'server_validate', 
      'effect':'start_charge; display_charge',
      'target':'charging'}

t_server_3 = {'trigger':'licence_info_rejected', 
      'source':'server_validate', 
      'effect':'display_connect_with_app; start_timer("app_timer", 5000)',
      'target':'app_identify'}

t_server_4 = {'trigger':'car_unplugged', 
      'source':'server_validate', 
      'effect':'disconnect_from_server; stop_display', 
      'target':'idle'}
#transitions from app_identify
t_app_1 = {'trigger':'app_start', 
      'source':'app_identify', 
      'effect':'start_charge; display_charge',
      'target':'charging'}

t_app_2= {'trigger':'app_failed',
      'source':'app_identify',
      'effect':'display_error_message',
      'target':'identification_failed'}

t_app_3 = {'trigger':'app_timer',
      'source':'app_identify',
      'effect':'display_error_message',
      'target':'identification_failed'}

t_app_4 = {'trigger':'car_unplugged',
      'source':'app_identify',
      'effect':'disconnect_from_server; stop_display',
      'target':'idle'}

#transitions from identification
t_identification = {'trigger':'car_unplugged',
      'source':'identification_failed',
      'effect':'disconnect_from_server',
      'target':'idle'}

#transitions from charging
t_charging_1 = {'trigger':'charge_complete',
      'source':'charging',
      'effect':'display_complete; send_complete',
      'target':'charge_complete'}

t_charging_2 = {'trigger':'car_unplugged',
       'source':'charging',
       'effect':'stop_display; disconnect_from_server',
       'target':'idle'}

#transitions from charge_complete
t_complete = {'trigger':'car_unplugged',
      'source':'charge_complete',
      'effect':'disconnect_from_server; stop_display',
      'target':'idle'}



# Change 4: We pass the set of states to the state machine
machine = Machine(name='charger', transitions=[t0, t_idle_1, t_tag_1, t_tag_2, t_tag_3, t_camera_1, t_camera_2, t_camera_3, t_server_1, t_server_2, t_server_3, t_server_4, t_app_1, t_app_2, t_app_3, t_app_4, t_identification, t_charging_1, t_charging_2, t_complete], obj=charger)
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
