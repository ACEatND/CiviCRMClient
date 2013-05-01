<!DOCTYPE html>
<html>
    <!--/***************************************************************
**
**     Developed by the Alliance for Catholic Education
**            at the University of Notre Dame
**
****************************************************************/-->
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Civi Mobile CRM Administrator login</title>
    </head>
    <body>

<?php
session_start();

if ($_POST && isset($_POST['login']) && $_POST['txtPassword'] == 'cppw1') {
  
	$_SESSION['user'] = "yhdgtej";
	echo "<a href=\"http://ace.nd.edu/civiCRMClient/admin.php\" title=\"Click here to edit settings\">Edit Settings</a>";
}
else
{
?>
<form action="" method="post">

<span>Please enter the administrator password</span>
<br />

<input type="password" name="txtPassword"></input>

<br />

<input type="submit" name="login" />
</form>
</body>
</html>
<?php
}
?>
