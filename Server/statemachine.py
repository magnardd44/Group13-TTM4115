from stmpy import Machine, Driver,  get_graphviz_dot
from threading import Thread
import paho.mqtt.client as mqtt
import json
import os
from dotenv import load_dotenv 
import time
from supabase import create_client, Client

load_dotenv() 

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

charger_server_topic = "/group-13/charger_server"
server_client_topic = "/group-13/server_client"

broker, port = "test.mosquitto.org", 1883
message = ""

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

        print(message_str)

        parsed_json = json.loads(message_str)

        if parsed_json["message_to"] != "server":
            return

        if parsed_json["current_charge"] != "":

            current_charge_message = {
                    "message_to": "client",
                    "current_charge": parsed_json["current_charge"]
                    }

            self.client.publish(server_client_topic, json.dumps(current_charge_message))
            return

        if parsed_json["trigger"] == "charge_complete":
            
            data, count = (
                supabase
                .table("test")
                .select("*")
                .order("created_at", desc=True)
                .limit(1)
                .execute())
            
            res  = (
                supabase
                .table("test")
                .update({"percentage_charged": 100 - parsed_json["starting_charge_percentage"]})
                .eq("id", int(data[1][0]["id"]))
                .execute())

            return

        if ( parsed_json["trigger"] == "tag_received" 
            or parsed_json["trigger"] == "licence_received"):

            result = []

            if parsed_json["trigger"] == "tag_received":
                self.stm_driver.send("tag_received", "server")

                result = ( 
                    supabase
                    .table("cars")
                    .select("*")
                    .eq("car_id", parsed_json["car_id"] )
                    .execute())
            else:
                self.stm_driver.send("licence_received", "server")

                result = ( 
                    supabase
                    .table("cars")
                    .select("*")
                    .eq("plate_number", parsed_json["plate_number"])
                    .execute())
            
            if len(result.data) == 0:

                error_message = ""

                if parsed_json["trigger"] == "tag_received":
                    error_message = "tag_info_rejected"
                else:
                    error_message = "licence_info_rejected"

                error_json = {
                    "message_to": "charger",
                    "trigger": error_message,
                }

                server.reject_information(error_message) 
                time.sleep(1)
                self.stm_driver.send("invalid_information", "server")
                self.client.publish(charger_server_topic, json.dumps(error_json))
                print("The car is not stored in the database!")
                return

            else:
                request_json = {
                    "plate_number": parsed_json["plate_number"],
                    "car_id": parsed_json["car_id"],                    
                }

                data, count = ( 
                    supabase
                    .table("test")
                    .insert(request_json)
                    .execute())

                res, count = ( 
                    supabase
                    .table("cars")
                    .update({"currently_charging": True})
                    .eq("plate_number", parsed_json["plate_number"])
                    .execute())


                self.stm_driver.send("accepted", "server")

                return


        elif parsed_json["trigger"] == "app_request":
            print("App requested")

            self.stm_driver.send("app_connected", "server")

            app_request_message = {
                "message_to": "client",
                "trigger": "app_request"
            }

            self.client.publish(server_client_topic, json.dumps(app_request_message))

        elif parsed_json["trigger"] == "charger_disconnected":
            data, count = ( 
                supabase
                .table('cars')
                .update({'currently_charging': False})
                .eq('currently_charging', True)
                .execute())     
            
            disconnect_message = {
                "message_to": "client",
                "currently_charging": False
                    }
            
            self.stm_driver.send("charger_disconnected", "server")

            self.client.publish(server_client_topic, json.dumps(disconnect_message))
            return

        else: 
            self.stm_driver.send(parsed_json["trigger"], "server")


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

class Server:
            
    def __init__(self):
        self.payment_info = ""
        self.json_data = {
                "message_to": "charger",
                "trigger": "server_ok",
                }
        self.error_json_data = {
                "message_to": "charger",
                "trigger": "rejected",
                "error_message": ""
                }
        
    def mark_charger_free(self):
        print("Charger is free")

    def mark_charger_occupied(self):
        print("Charger is occupied")
    
    def start_validation(self):
        print("Validation started")
    
    def send_ok(self):
        self.mqtt_client.publish(charger_server_topic, json.dumps(self.json_data))
        print("Charging started")
        
    def store_info(self):
        print("Info stored")

    def issue_payment(self):
        print("Payment issued")
        
    def reject_information(self, message):
        if message == "tag_info_rejected":
            self.error_json_data["error_message"] = "tag_info_rejected"
         
        elif message == "licence_info_rejected":
           self.error_json_data["error_message"] = "licence_info_rejected"
        
        else:
            self.error_json_data["error_message"] = "app_failed"
           
        self.mqtt_client.publish(charger_server_topic, json.dumps(self.error_json_data))
        print("Charger notified")


server = Server()
        
# initial transition
t0 = {'source':'initial',
      'target':'idle'}

# idle transitions
t_idle = {'trigger':'charger_connected',
      'source':'idle',
      'effect':'mark_charger_occupied',
      'target':'connected'}

# connected transitions
t_conn_1 = {'trigger':'tag_received', 
      'source':'connected', 
      'effect':'start_validation',
      'target':'validate_pay_info'}

t_conn_2 = {'trigger':'licence_received', 
      'source':'connected', 
      'effect':'start_validation',
      'target':'validate_pay_info'}

t_conn_3 = {'trigger':'app_connected', 
      'source':'connected', 
      'effect':'start_validation',
      'target':'validate_pay_info'}

t_conn_4 = {'trigger':'identification_failed', 
      'source':'connected',
      'target':'wait_disconnect'}

t_conn_5 = {'trigger':'charger_disconnected',
      'source':'connected',
      'effect':'mark_charger_free',
      'target':'idle'}

# validate_pay_info transitions
t_val_1 = {'trigger':'accepted', 
      'source':'validate_pay_info', 
      'effect':'send_ok; store_info',
      'target':'charging'}

t_val_2 = {'trigger':'invalid_information', 
      'source':'validate_pay_info', 
      'effect':'reject_information',
      'target':'connected'}

t_val_3 = {'trigger':'charger_disconnected',
      'source':'validate_pay_info',
      'effect':'mark_charger_free',
      'target':'idle'}

# Charging transitions
t_char_1 = {'trigger':'charge_complete',
      'source':'charging',
      'effect':'issue_payment',
      'target':'wait_disconnect'}

t_char_2 = {'trigger':'charger_disconnected',
      'source':'charging',
      'effect':'issue_payment; mark_charger_free',
      'target':'idle'}

# Wait transitions
t_wait = {'trigger':'charger_disconnected',
      'source':'wait_disconnect',
      'effect':'mark_charger_free',
      'target':'idle'}


# Change 4: We pass the set of states to the state machine
machine = Machine(name='server', transitions=[t0, t_idle, t_char_1, t_char_2, t_conn_1 ,t_conn_2, t_conn_3, t_conn_4, t_conn_5, t_val_1, t_val_2, t_val_3, t_wait], obj=server)
with open("graph_backend.gv", "w") as file:
      print(get_graphviz_dot(machine), file=file)
server.stm = machine

driver = Driver()
driver.add_machine(machine) 

myclient = MQTT_Client_1()
server.mqtt_client = myclient.client
myclient.stm_driver = driver

driver.start()
myclient.start(broker, port)
