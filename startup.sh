#!/bin/bash

clear
echo
echo
 
echo "Welcome to the Startup Utility for the CiviCRMClient!"
echo "Press enter to continue"
read
echo
echo
 
#working
echo "Backing up REST.php"
echo
echo
cp ../administrator/components/com_civicrm/civicrm/CRM/Utils/REST.php ../administrator/components/com_civicrm/civicrm/CRM/Utils/REST.php.old
echo
echo
sed 's/)))/),'"'"'contact_id'"'"' => $result[0]))/g' <../administrator/components/com_civicrm/civicrm/CRM/Utils/REST.php.old >../administrator/components/com_civicrm/civicrm/CRM/Utils/REST.php
echo "REST.php changed"
echo
echo
echo
 
#working
echo "Is your version of CiviCRM before 4.2.8? (anything except 'yes' will default to no)"
read newerversion
 
if [[ $newerversion == "yes" ]]; then
        str=`cat adding.txt`
        echo `cat adding.txt` >> ../administrator/components/com_civicrm/civicrm/api/v3/Contact.php
        echo "Functions Added"
        echo
        echo
        echo
fi

echo "backing up Application.Constants.min.js"
cp js/Application.Constants.min.js js/Application.Constants.min.js.old

 
key=`grep 'SITE_KEY' ../administrator/components/com_civicrm/civicrm.settings.php | awk 'BEGIN{FS=","}{print $2}'`
key=${key:2:32}

eval "sed 's/API_KEY_GOES_HERE/$key/g' <js/Application.Constants.min.js.old >js/Application.Constants.min.js"

echo
echo 
echo "API Key set"
echo
echo
 
echo "Type the URL for your server"
echo 'do NOT include "http://" (e.g. example.com)'
read site
echo $site
eval "sed 's/example.com/$site/g' <js/Application.Constants.min.js.old >js/Application.Constants.min.js"
echo "URL set"
echo
echo
 
echo "What would you like the administrator password to be?"
read password
#echo $password
echo "Backing up admin_login"
cp admin_login.php admin_login.php.old
echo
echo
eval "sed 's/YOUR_PASSWORD_GOES_HERE/$password/g' <admin_login.php.old >admin_login.php"
echo "Password set"
echo
echo
echo
 
#working
echo "The server key is $key"
echo "Enter that value into the api_key field in the database for the contacts you wish to have access to the mobile client."
echo
echo
echo
echo "Setup complete"
