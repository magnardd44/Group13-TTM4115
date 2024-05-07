# group13-ttm4115

# Instructions for the Server folder:

    First create a virtual environment for the Server folder:

# Install the virtualenv package

        pip install virtualenv

# Create the virtualenv with the name "env"

        cd Server/
        python3 -m venv env

# Activate the venv:

        source env/bin/activate

# Installing the packages in the Server venv

        pip install -r requirements.txt

# Instructions for the Charger folder:

    Then create a virtual environment for the Charger folder:

# Create the virtualenv with the name "env"

        cd ../Charger
        python3 -m venv env

# Activate the venv:

        source env/bin/activate

# Installing the packages in the Charger venv

        pip install -r requirements.txt

# Instructions for the Frontend_website folder:

# Frontend_website

        cd ../Frontend_website
        npm install

        npm run dev

        Open localhost on port 3000 (http://localhost:3000/)
