# BotStatistic

Установка:

python -m venv venv

call venv/Scripts/activate.bat (linux source venv/bin/activate)

pip install -r requirements.txt


## Configuration

This application uses a `.env` file for configuration.

Create a file named `.env` in the root directory of the project.

Add the following variable to the `.env` file:

`PHOTO_FOLDER_PATH`

Example:

`PHOTO_FOLDER_PATH="/path/to/your/photo_outputs_folder"`

If this variable is not set in the `.env` file, the application will default to `/home/iservice4070/NeuroAvatar/outputs`.
