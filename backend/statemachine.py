from stmpy import Machine, Driver

class Server:
            
    def __init__(self):
        pass
    
    def what_now(self):
        send = input("What do you want to send: ")
        self.stm.send(send)
    def mark_charger_free():
        print("Charger is free")
    
    def mark_charger_occupied():
        print("Charger is occupied")
    
    def start_validation():
        print("Validation started")
    
    def start_charge():
        print("Charging started")
        
    def store_info():
        print("Info stored")

    def issue_payment():
        print("payment issued")
        
    def notify_charger():
        print("Charger notified")


server = Server()
        
# initial transition
t0 = {'source':'initial',
      'effect':'what_now',
      'target':'idle'}

t1 = {'trigger':'charger_connected',
      'source':'idle',
      'effect':'mark_charger_occupied; what_now',
      'target':'connected'}

t2 

t3 = {'trigger':'tag_received', 
      'source':'connected', 
      'effect':'start_validation; what_now',
      'target':'validate'}

t3 = {'trigger':'licence_received', 
      'source':'connected', 
      'effect':'start_validation; what_now',
      'target':'validate'}

t4 = {'trigger':'app_connected', 
      'source':'connected', 
      'effect':'start_validation; what_now',
      'target':'validate'}

t5 = {'trigger':'all_denied', 
      'source':'validate', 
      'effect':'notify_charger; what_now',
      'target':'wait_disconnect'}

t6 = {'trigger':'accepted', 
      'source':'validate', 
      'effect':'start_charger; store_info; what_now',
      'target':'charging'}

t7 = {'trigger':'charge_complete',
      'source':'charging',
      'effect':'issue_payment; what_now',
      'target':'wait_disconnect'}

t8 = {'trigger':'charger_disconnected',
      'source':'charging',
      'effect':'issue_payment; mark_charger_free; what_now',
      'target':'idle'}

t9 = {'trigger':'charger_disconnected',
      'source':'wait_disconnect',
      'effect':'mark_charger_free; what_now',
      'target':'idle'}



# Change 4: We pass the set of states to the state machine
machine = Machine(name='server', transitions=[t0, t1, t2, t3, t4 ,t5, t6, t7, t8, t9, t10, t11, t12], obj=charger)
server.stm = machine

driver = Driver()
driver.add_machine(machine)
driver.start()
