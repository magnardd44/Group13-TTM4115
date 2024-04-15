from stmpy import Machine, Driver

class Charger:
            
    def __init__(self):
        pass
        

    def what_now(self):
        send = input("What do you want to send: ")
        self.stm.send(send)
    def check_tag(help):
        print('blablabala') 
        
    def connect_to_server(help):
        print('Connected to server')
        
    def check_camera(self):
        print('Checking camera')
        
    def start_charge(self):
        print('Starting charge')
        
    def display_charge(self):
        print('Displaying charge')
        
    def check_app(self):
        print('Checking app')
        
    def display_complete(self):
        print('Display completed')
        
    def stop_display(self):
        print('Stopping display')
        
    def display_error_message(self):
        print('Error')
        
    def disconnect_from_server(self):
        print('Disconnecting from server')
        
    def issue_payment(self):
        print('Issuing payment')
        

charger = Charger()
        
# initial transition
t0 = {'source':'initial',
      'effect':'what_now',
      'target':'idle'}

t1 = {'trigger':'car_plugged_in',
      'source':'idle',
      'effect':'check_tag; what_now',
      'target':'tag_identify'}

t2 = {'trigger':'tag_detected', 
      'source':'tag_identify', 
      'effect':'start_charge; display_charge; what_now',
      'target':'charging'}

t3 = {'trigger':'tag_failed', 
      'source':'tag_identify', 
      'effect':'check_camera; what_now',
      'target':'camera_identify'}

t4 = {'trigger':'licence_detected', 
      'source':'camera_identify', 
      'effect':'start_charge; display_charge; what_now',
      'target':'charging'}

t5 = {'trigger':'camera_failed', 
      'source':'camera_identify', 
      'effect':'check_app; start_timer("t", 5000); what_now',
      'target':'app_identify'}

t6 = {'trigger':'app_start', 
      'source':'app_identify', 
      'effect':'start_charge; display_charge; stop_timer("t"); what_now',
      'target':'charging'}

t7 = {'trigger':'app_failed',
      'source':'app_identify',
      'effect':'display_error_message; stop_timer("t"); what_now',
      'target':'identification_failed'}

t8 = {'trigger':'t',
      'source':'app_identify',
      'effect':'display_error_message; what_now',
      'target':'identification_failed'}

t9 = {'trigger':'car_unplugged',
      'source':'identification_failed',
      'effect':'disconnect_from_server; what_now',
      'target':'idle'}

t10 = {'trigger':'charge_complete',
      'source':'charging',
      'effect':'display_complete; issue_payment; what_now',
      'target':'charge_complete'}

t11 = {'trigger':'car_unplugged',
       'source':'charging',
       'effect':'stop_display; disconnect_from_server; issue_payment; what_now',
       'target':'idle'}

t12 = {'trigger':'car_unplugged',
      'source':'charge_complete',
      'effect':'disconnect_from_server; stop_display; what_now',
      'target':'idle'}



# Change 4: We pass the set of states to the state machine
machine = Machine(name='charger', transitions=[t0, t1, t2, t3, t4 ,t5, t6, t7, t8, t9, t10, t11, t12], obj=charger)
charger.stm = machine

driver = Driver()
driver.add_machine(machine)
driver.start()
