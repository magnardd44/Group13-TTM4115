# group13-ttm4115

# Instructions for the Server folder:

    First create a virtual environment for the Server folder:

<h2>Install the virtualenv package</h2>

        pip install virtualenv

<h2>Create the virtualenv with the name "serverEnv"</h2>

        cd Server/
        python3 -m venv serverEnv

<h2>Activate the venv:</h2>

        source serverEnv/bin/activate

<h2>Install the packages in the Server venv</h2>

        pip install -r requirements.txt

<h2>Then run the code by using (if you don't have python installed, go to python.org and follow their instructions):</h2>
        
        python3 statemachine.py

# Instructions for the Charger folder:

    Then create a virtual environment for the Charger folder:

<h2>Create the virtualenv with the name "chargerEnv"</h2>

        cd ../Charger
        python3 -m venv chargerEnv

<h2>Activate the venv:</h2>

        source chargerEnv/bin/activate

<h2>Install the packages in the Charger venv</h2>

        pip install -r requirements.txt

<h2>Then run the code by using (if you don't have python installed, go to python.org and follow their instructions):</h2>
        
        python3 statemachine.py

# Instructions for the Frontend_website folder:

        cd ../Frontend_website
        npm install
        npm run dev

        Open localhost on port 3000 (http://localhost:3000/)
