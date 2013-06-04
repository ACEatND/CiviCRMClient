<?php

/***************************************************************
**
**     Developed by the Alliance for Catholic Education
**            at the University of Notre Dame
**
****************************************************************/


session_start();

$logged_id = $_SESSION['user'] == "yhdgtej";
$current_folder = dirname(__FILE__);

if (!$logged_id) {
  include ($current_folder.'/admin_login.php');
  return;
}

if ($_POST && isset($_POST['save']) && $logged_id) {

  $content = '';

  $content .= "var SHOW_ORGANIZATIONS = ".($_POST['chkOrganizations'] == 'on' ? "true;" : "false;")."\n";
  $content .= "var RES_ORGANIZATION_LABEL = \"".str_replace("\"", "\\\"", $_POST['txtOrganizationName'])."\";\n";
  $content .= "var RES_ORGANIZATIONS_LABEL = \"".str_replace("\"", "\\\"", $_POST['txtOrganizationsName'])."\";\n";
  $content .= "var ORGANIZATIONS_ORDER = ".str_replace("\"", "\\\"", $_POST['numOrganizations']).";\n";

  $content .= "var SHOW_INDIVIDUALS = ".($_POST['chkIndividuals'] == 'on' ? "true;" : "false;")."\n";
  $content .= "var RES_INDIVIDUAL_LABEL = \"".str_replace("\"", "\\\"", $_POST['txtIndividualName'])."\";\n";
  $content .= "var RES_INDIVIDUALS_LABEL = \"".str_replace("\"", "\\\"", $_POST['txtIndividualsName'])."\";\n";
  $content .= "var INDIVIDUALS_ORDER = ".str_replace("\"", "\\\"", $_POST['numIndividuals']).";\n";

  $content .= "var SHOW_HOUSEHOLDS = ".($_POST['chkHouseholds'] == 'on' ? "true;" : "false;")."\n";
  $content .= "var RES_HOUSEHOLD_LABEL = \"".str_replace("\"", "\\\"", $_POST['txtHouseholdName'])."\";\n";
  $content .= "var RES_HOUSEHOLDS_LABEL = \"".str_replace("\"", "\\\"", $_POST['txtHouseholdsName'])."\";\n";
  $content .= "var HOUSEHOLDS_ORDER = ".str_replace("\"", "\\\"", $_POST['numHouseholds']).";\n";

  $content .= "var SHOW_OPPORTUNITIES = ".($_POST['chkOpportunities'] == 'on' ? "true;" : "false;")."\n";
  $content .= "var RES_OPPORTUNITY_LABEL = \"".str_replace("\"", "\\\"", $_POST['txtOpportunityName'])."\";\n";
  $content .= "var RES_OPPORTUNITIES_LABEL = \"".str_replace("\"", "\\\"", $_POST['txtOpportunitiesName'])."\";\n";
  $content .= "var OPPORTUNITIES_ORDER = ".str_replace("\"", "\\\"", $_POST['numOpportunities']).";\n";

  $content .= "var SHOW_LEADS = ".($_POST['chkLeads'] == 'on' ? "true;" : "false;")."\n";
  $content .= "var RES_LEAD_LABEL = \"".str_replace("\"", "\\\"", $_POST['txtLeadName'])."\";\n";
  $content .= "var RES_LEADS_LABEL = \"".str_replace("\"", "\\\"", $_POST['txtLeadsName'])."\";\n";
  $content .= "var LEADS_ORDER = ".str_replace("\"", "\\\"", $_POST['numLeads']).";\n";

  $content .= "var SHOW_CALLS = ".($_POST['chkCalls'] == 'on' ? "true;" : "false;")."\n";
  $content .= "var RES_CALL_LABEL = \"".str_replace("\"", "\\\"", $_POST['txtCallName'])."\";\n";
  $content .= "var RES_CALLS_LABEL = \"".str_replace("\"", "\\\"", $_POST['txtCallsName'])."\";\n";
  $content .= "var CALLS_ORDER = ".str_replace("\"", "\\\"", $_POST['numCalls']).";\n";

  $content .= "var SHOW_MEETINGS = ".($_POST['chkMeetings'] == 'on' ? "true;" : "false;")."\n";
  $content .= "var RES_MEETING_LABEL = \"".str_replace("\"", "\\\"", $_POST['txtMeetingName'])."\";\n";
  $content .= "var RES_MEETINGS_LABEL = \"".str_replace("\"", "\\\"", $_POST['txtMeetingsName'])."\";\n";
  $content .= "var MEETINGS_ORDER = ".str_replace("\"", "\\\"", $_POST['numMeetings']).";\n";

  $content .= "var SHOW_TASKS = ".($_POST['chkTasks'] == 'on' ? "true;" : "false;")."\n";
  $content .= "var RES_TASK_LABEL = \"".str_replace("\"", "\\\"", $_POST['txtTaskName'])."\";\n";
  $content .= "var RES_TASKS_LABEL = \"".str_replace("\"", "\\\"", $_POST['txtTasksName'])."\";\n";
  $content .= "var TASKS_ORDER = ".str_replace("\"", "\\\"", $_POST['numTasks']).";\n";

  $content .= "var CONTACTS_SEARCH_DISTANCE_OPTIONS = [];\n";

  $content .= GetCONTACTS_SEARCH_DISTANCE_OPTION(0, $_POST['txtSearchDistanceOption0Label'], 0);
  for ($index = 1; $index < 4; $index++) {
    $content .= GetCONTACTS_SEARCH_DISTANCE_OPTION($index, $_POST['txtSearchDistanceOption'.$index.'Label'], $_POST['numSearchDistanceOption'.$index.'Value']);
  }

  $content .= GetCONTACTS_SEARCH_DEFAULT_RADIUS("CONTACTS_SEARCH_DISTANCE_DEF_OPTION_ORG", $_POST['OrgSearchDistanceDefaultRadio']);
  $content .= GetCONTACTS_SEARCH_DEFAULT_RADIUS("CONTACTS_SEARCH_DISTANCE_DEF_OPTION_IND", $_POST['IndSearchDistanceDefaultRadio']);
  $content .= GetCONTACTS_SEARCH_DEFAULT_RADIUS("CONTACTS_SEARCH_DISTANCE_DEF_OPTION_HH", $_POST['HHSearchDistanceDefaultRadio']);

  $content .= "var LIST_ITEMS_ON_PAGE = ".str_replace("\"", "\\\"", $_POST['numListItemsOnPage']).";\n";

  //echo "<pre>".$content."</pre>";

  //echo $current_folder;

  $myFile = $current_folder."/js/Settings.js";
  $fh = fopen($myFile, 'w') or die("can't open file");
  fwrite($fh, $content);
  fclose($fh);

}

srand ((double) microtime( )*1000000);
$random_number = rand( );

function GetCONTACTS_SEARCH_DISTANCE_OPTION($index, $optionLabel, $optionValue) {
  return "CONTACTS_SEARCH_DISTANCE_OPTIONS[".$index."] = { label:\"".str_replace("\"", "\\\"", $optionLabel)."\", value:\"".$optionValue."\"};\n";
}

function GetCONTACTS_SEARCH_DEFAULT_RADIUS($jsConstName, $optionIndex) {
  //if ($optionIndex == '0') {
    return "var ".$jsConstName." = ".$optionIndex.";\n";
  //} else {
    //return "var ".$jsConstName." = \"".$_POST['numSearchDistanceOption'.$optionIndex.'Value']."\"\n";
  //}
}

?>


<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <!-- CDN BEGIN -->
        <!--
        <link rel="stylesheet" href="http://code.jquery.com/mobile/1.0b2/jquery.mobile-1.0b2.min.css" />
        <script type="text/javascript" src="http://code.jquery.com/jquery-1.6.2.min.js"></script>
        <script type="text/javascript" src="js/jquery.mobile-config.js"></script>
        <script type="text/javascript" src="http://code.jquery.com/mobile/1.0b2/jquery.mobile-1.0b2.min.js"></script>
        -->
        <!-- CDN END -->
        <link rel="stylesheet" href="lib/jquery.mobile/jquery.mobile-1.0b2.min.css" />
        <script type="text/javascript" src="lib/jquery-1.6.2.min.js"></script>
        <script type="text/javascript" src="js/Settings.js?<?php  echo "$random_number"; ?>"></script>
        <link rel="stylesheet" href="css/style.min.css" />
        <title>Civi Mobile CRM</title>


<script type="text/javascript">
        $(document).ready(function() {
            $('#numOrganizations').val(ORGANIZATIONS_ORDER);
            $('#chkOrganizations').attr('checked', SHOW_ORGANIZATIONS);
            $('#txtOrganizationName').val(RES_ORGANIZATION_LABEL);
            $('#txtOrganizationsName').val(RES_ORGANIZATIONS_LABEL);

            $('#numIndividuals').val(INDIVIDUALS_ORDER);
            $('#chkIndividuals').attr('checked', SHOW_INDIVIDUALS);
            $('#txtIndividualName').val(RES_INDIVIDUAL_LABEL);
            $('#txtIndividualsName').val(RES_INDIVIDUALS_LABEL);

            $('#numHouseholds').val(HOUSEHOLDS_ORDER);
            $('#chkHouseholds').attr('checked', SHOW_HOUSEHOLDS);
            $('#txtHouseholdName').val(RES_HOUSEHOLD_LABEL);
            $('#txtHouseholdsName').val(RES_HOUSEHOLDS_LABEL);

            $('#numOpportunities').val(OPPORTUNITIES_ORDER);
            $('#chkOpportunities').attr('checked', SHOW_OPPORTUNITIES);
            $('#txtOpportunityName').val(RES_OPPORTUNITY_LABEL);
            $('#txtOpportunitiesName').val(RES_OPPORTUNITIES_LABEL);

            $('#numLeads').val(LEADS_ORDER);
            $('#chkLeads').attr('checked', SHOW_LEADS);
            $('#txtLeadName').val(RES_LEAD_LABEL);
            $('#txtLeadsName').val(RES_LEADS_LABEL);

            $('#numCalls').val(CALLS_ORDER);
            $('#chkCalls').attr('checked', SHOW_CALLS);
            $('#txtCallName').val(RES_CALL_LABEL);
            $('#txtCallsName').val(RES_CALLS_LABEL);

            $('#numMeetings').val(MEETINGS_ORDER);
            $('#chkMeetings').attr('checked', SHOW_MEETINGS);
            $('#txtMeetingName').val(RES_MEETING_LABEL);
            $('#txtMeetingsName').val(RES_MEETINGS_LABEL);

            $('#numTasks').val(TASKS_ORDER);
            $('#chkTasks').attr('checked', SHOW_TASKS);
            $('#txtTaskName').val(RES_TASK_LABEL);
            $('#txtTasksName').val(RES_TASKS_LABEL);

            for (index = 0; index < CONTACTS_SEARCH_DISTANCE_OPTIONS.length; index++ ) {
              $("#txtSearchDistanceOption" + index + "Label").val(CONTACTS_SEARCH_DISTANCE_OPTIONS[index].label);
              $("#lblSearchDistanceOption" + index + "Caption").text(CONTACTS_SEARCH_DISTANCE_OPTIONS[index].label);

              if (index > 0) {
                $("#numSearchDistanceOption" + index + "Value").val(CONTACTS_SEARCH_DISTANCE_OPTIONS[index].value);
              }
            }

            $('input[name="OrgSearchDistanceDefaultRadio"]').attr('checked', false);
            if ($('input[name="OrgSearchDistanceDefaultRadio"][value="' + CONTACTS_SEARCH_DISTANCE_DEF_OPTION_ORG + '"]').length > 0) {
              $('input[name="OrgSearchDistanceDefaultRadio"][value="' + CONTACTS_SEARCH_DISTANCE_DEF_OPTION_ORG + '"]').attr('checked', true);
            } else {
              $('input[name="OrgSearchDistanceDefaultRadio"][value="0"]').attr('checked', true);
            }
            
            $('input[name="IndSearchDistanceDefaultRadio"]').attr('checked', false);
            if ($('input[name="IndSearchDistanceDefaultRadio"][value="' + CONTACTS_SEARCH_DISTANCE_DEF_OPTION_IND + '"]').length > 0) {
              $('input[name="IndSearchDistanceDefaultRadio"][value="' + CONTACTS_SEARCH_DISTANCE_DEF_OPTION_IND + '"]').attr('checked', true);
            } else {
              $('input[name="IndSearchDistanceDefaultRadio"][value="0"]').attr('checked', true);
            }
            
            $('input[name="HHSearchDistanceDefaultRadio"]').attr('checked', false);
            if ($('input[name="HHSearchDistanceDefaultRadio"][value="' + CONTACTS_SEARCH_DISTANCE_DEF_OPTION_HH + '"]').length > 0) {
              $('input[name="HHSearchDistanceDefaultRadio"][value="' + CONTACTS_SEARCH_DISTANCE_DEF_OPTION_HH + '"]').attr('checked', true);
            } else {
              $('input[name="HHSearchDistanceDefaultRadio"][value="0"]').attr('checked', true);
            }

            $("#txtSearchDistanceOption0Label").bind("keyup", function() {
              $("#lblSearchDistanceOption0Caption").text($("#txtSearchDistanceOption0Label").val());
            });
            $("#txtSearchDistanceOption1Label").bind("keyup", function() {
              $("#lblSearchDistanceOption1Caption").text($("#txtSearchDistanceOption1Label").val());
            });
            $("#txtSearchDistanceOption2Label").bind("keyup", function() {
              $("#lblSearchDistanceOption2Caption").text($("#txtSearchDistanceOption2Label").val());
            });
            $("#txtSearchDistanceOption3Label").bind("keyup", function() {
              $("#lblSearchDistanceOption3Caption").text($("#txtSearchDistanceOption3Label").val());
            });

            $('#numListItemsOnPage').val(LIST_ITEMS_ON_PAGE);

        });

</script>

    </head>
    <body>

<form action="#" method="post">

<table cellspacing="0" cellpadding="0" rules="none">
  <tr>
    <td>&nbsp;</td>
    <td>position</td>
  </tr>
  <tr>
    <td>
      <strong>Organizations</strong>
    </td>
    <td>
      <input type="number" id="numOrganizations" name="numOrganizations"></input>
    </td>
  </tr>
  <tr>
    <td>
      <label for="chkOrganizations">Show Organizations</label>
    </td>
    <td>
      <input type="checkbox" id="chkOrganizations" name="chkOrganizations"></input>
    </td>
  </tr>
  <tr>
    <td>
      <label for="txtOrganizationName">Organization page name</label>
    </td>
    <td>
      <input type="text" id="txtOrganizationName" name="txtOrganizationName"></input>
    </td>
  </tr>
  <tr>
    <td>
      <label for="txtOrganizationsName">Organizations name</label>
    </td>
    <td>
      <input type="text" id="txtOrganizationsName" name="txtOrganizationsName"></input>
    </td>
  </tr>

  <tr>
    <td colspan="2">&nbsp;</td>
  </tr>
  <tr>
    <td>
      <strong>Individuals</strong>
    </td>
    <td>
      <input type="number" id="numIndividuals" name="numIndividuals"></input>
    </td>
  </tr>
  <tr>
    <td>
      <label for="chkIndividuals">Show Individuals</label>
    </td>
    <td>
      <input type="checkbox" id="chkIndividuals" name="chkIndividuals"></input>
    </td>
  </tr>
  <tr>
    <td>
      <label for="txtIndividualName">Individual page name</label>
    </td>
    <td>
      <input type="text" id="txtIndividualName" name="txtIndividualName"></input>
    </td>
  </tr>
  <tr>
    <td>
      <label for="txtIndividualsName">Individuals name</label>
    </td>
    <td>
      <input type="text" id="txtIndividualsName" name="txtIndividualsName"></input>
    </td>
  </tr>

  <tr>
    <td colspan="2">&nbsp;</td>
  </tr>
  <tr>
    <td>
      <strong>Households</strong>
    </td>
    <td>
      <input type="number" id="numHouseholds" name="numHouseholds"></input>
    </td>
  </tr>
  <tr>
    <td>
      <label for="chkHouseholds">Show Households</label>
    </td>
    <td>
      <input type="checkbox" id="chkHouseholds" name="chkHouseholds"></input>
    </td>
  </tr>
  <tr>
    <td>
      <label for="txtHouseholdName">Household page name</label>
    </td>
    <td>
      <input type="text" id="txtHouseholdName" name="txtHouseholdName"></input>
    </td>
  </tr>
  <tr>
    <td>
      <label for="txtHouseholdsName">Households name</label>
    </td>
    <td>
      <input type="text" id="txtHouseholdsName" name="txtHouseholdsName"></input>
    </td>
  </tr>

  <tr>
    <td colspan="2">&nbsp;</td>
  </tr>
  <tr>
    <td>
      <strong>Opportunities</strong>
    </td>
    <td>
      <input type="number" id="numOpportunities" name="numOpportunities"></input>
    </td>
  </tr>
  <tr>
    <td>
      <label for="chkOpportunities">Show Opportunities</label>
    </td>
    <td>
      <input type="checkbox" id="chkOpportunities" name="chkOpportunities"></input>
    </td>
  </tr>
  <tr>
    <td>
      <label for="txtOpportunityName">Opportunity page name</label>
    </td>
    <td>
      <input type="text" id="txtOpportunityName" name="txtOpportunityName"></input>
    </td>
  </tr>
  <tr>
    <td>
      <label for="txtOpportunitiesName">Opportunities name</label>
    </td>
    <td>
      <input type="text" id="txtOpportunitiesName" name="txtOpportunitiesName"></input>
    </td>
  </tr>

  <tr>
    <td colspan="2">&nbsp;</td>
  </tr>
  <tr>
    <td>
      <strong>Leads</strong>
    </td>
    <td>
      <input type="number" id="numLeads" name="numLeads"></input>
    </td>
  </tr>
  <tr>
    <td>
      <label for="chkLeads">Show Leads</label>
    </td>
    <td>
      <input type="checkbox" id="chkLeads" name="chkLeads"></input>
    </td>
  </tr>
  <tr>
    <td>
      <label for="txtLeadName">Lead page name</label>
    </td>
    <td>
      <input type="text" id="txtLeadName" name="txtLeadName"></input>
    </td>
  </tr>
  <tr>
    <td>
      <label for="txtLeadsName">Leads name</label>
    </td>
    <td>
      <input type="text" id="txtLeadsName" name="txtLeadsName"></input>
    </td>
  </tr>

  <tr>
    <td colspan="2">&nbsp;</td>
  </tr>
  <tr>
    <td>
      <strong>Calls</strong>
    </td>
    <td>
      <input type="number" id="numCalls" name="numCalls"></input>
    </td>
  </tr>
  <tr>
    <td>
      <label for="chkCalls">Show Calls</label>
    </td>
    <td>
      <input type="checkbox" id="chkCalls" name="chkCalls"></input>
    </td>
  </tr>
  <tr>
    <td>
      <label for="txtCallName">Call page name</label>
    </td>
    <td>
      <input type="text" id="txtCallName" name="txtCallName"></input>
    </td>
  </tr>
  <tr>
    <td>
      <label for="txtCallsName">Calls name</label>
    </td>
    <td>
      <input type="text" id="txtCallsName" name="txtCallsName"></input>
    </td>
  </tr>

  <tr>
    <td colspan="2">&nbsp;</td>
  </tr>
  <tr>
    <td>
      <strong>Meetings</strong>
    </td>
    <td>
      <input type="number" id="numMeetings" name="numMeetings"></input>
    </td>
  </tr>
  <tr>
    <td>
      <label for="chkMeetings">Show Meetings</label>
    </td>
    <td>
      <input type="checkbox" id="chkMeetings" name="chkMeetings"></input>
    </td>
  </tr>
  <tr>
    <td>
      <label for="txtMeetingName">Meeting page name</label>
    </td>
    <td>
      <input type="text" id="txtMeetingName" name="txtMeetingName"></input>
    </td>
  </tr>
  <tr>
    <td>
      <label for="txtMeetingsName">Meetings name</label>
    </td>
    <td>
      <input type="text" id="txtMeetingsName" name="txtMeetingsName"></input>
    </td>
  </tr>

  <tr>
    <td colspan="2">&nbsp;</td>
  </tr>
  <tr>
    <td>
      <strong>Tasks</strong>
    </td>
    <td>
      <input type="number" id="numTasks" name="numTasks"></input>
    </td>
  </tr>
  <tr>
    <td>
      <label for="chkTasks">Show Tasks</label>
    </td>
    <td>
      <input type="checkbox" id="chkTasks" name="chkTasks"></input>
    </td>
  </tr>
  <tr>
    <td>
      <label for="txtTaskName">Task page name</label>
    </td>
    <td>
      <input type="text" id="txtTaskName" name="txtTaskName"></input>
    </td>
  </tr>
  <tr>
    <td>
      <label for="txtTasksName">Tasks name</label>
    </td>
    <td>
      <input type="text" id="txtTasksName" name="txtTasksName"></input>
    </td>
  </tr>
</table>

<br />

<table border="1">
  <tr>
    <td colspan="5" style="text-align: center;"><strong>Contacts Search options</strong></td>
  </tr>
  <tr>
    <td>&nbsp;</td>
    <td>All</td>
    <td>Option 1</td>
    <td>Option 2</td>
    <td>Option 3</td>
  </tr>
  <tr>
    <td>Option Label</td>
    <td>
      <input type="text" id="txtSearchDistanceOption0Label" name="txtSearchDistanceOption0Label"></input>
    </td>
    <td>
      <input type="text" id="txtSearchDistanceOption1Label" name="txtSearchDistanceOption1Label"></input>
    </td>
    <td>
      <input type="text" id="txtSearchDistanceOption2Label" name="txtSearchDistanceOption2Label"></input>
    </td>
    <td>
      <input type="text" id="txtSearchDistanceOption3Label" name="txtSearchDistanceOption3Label"></input>
    </td>
  </tr>
  <tr>
    <td>Distance, miles</td>
    <td>All</td>
    <td>
      <input type="number" id="numSearchDistanceOption1Value" name="numSearchDistanceOption1Value" step="any"></input>
    </td>
    <td>
      <input type="number" id="numSearchDistanceOption2Value" name="numSearchDistanceOption2Value" step="any"></input>
    </td>
    <td>
      <input type="number" id="numSearchDistanceOption3Value" name="numSearchDistanceOption3Value" step="any"></input>
    </td>
  </tr>
  <tr>
    <td colspan="5" style="text-align: center;"><strong>Default distances, miles</strong></td>
  </tr>
  <tr>
    <td>Search</td>
    <td><span style="font-weight: 700;" id="lblSearchDistanceOption0Caption"></span></td>
    <td><span style="font-weight: 700;" id="lblSearchDistanceOption1Caption"></span></td>
    <td><span style="font-weight: 700;" id="lblSearchDistanceOption2Caption"></span></td>
    <td><span style="font-weight: 700;" id="lblSearchDistanceOption3Caption"></span></td>
  </tr>
  <tr>
    <td>Organizations</td>
    <td>
      <input type="radio" name="OrgSearchDistanceDefaultRadio" value="0" />
    </td>
    <td>
      <input type="radio" name="OrgSearchDistanceDefaultRadio" value="1" />
    </td>
    <td>
      <input type="radio" name="OrgSearchDistanceDefaultRadio" value="2" />
    </td>
    <td>
      <input type="radio" name="OrgSearchDistanceDefaultRadio" value="3" />
    </td>
  </tr>
  <tr>
    <td>Individuals</td>
    <td>
      <input type="radio" name="IndSearchDistanceDefaultRadio" value="0" />
    </td>
    <td>
      <input type="radio" name="IndSearchDistanceDefaultRadio" value="1" />
    </td>
    <td>
      <input type="radio" name="IndSearchDistanceDefaultRadio" value="2" />
    </td>
    <td>
      <input type="radio" name="IndSearchDistanceDefaultRadio" value="3" />
    </td>
  </tr>
  <tr>
    <td>Households</td>
    <td>
      <input type="radio" name="HHSearchDistanceDefaultRadio" value="0" />
    </td>
    <td>
      <input type="radio" name="HHSearchDistanceDefaultRadio" value="1" />
    </td>
    <td>
      <input type="radio" name="HHSearchDistanceDefaultRadio" value="2" />
    </td>
    <td>
      <input type="radio" name="HHSearchDistanceDefaultRadio" value="3" />
    </td>
  </tr>
</table>

<br />

<label for="numListItemsOnPage">Quantity of items on list page</label>
<input type="number" id="numListItemsOnPage" name="numListItemsOnPage"></input>

<br />

<input type="submit" name="save" />
</form>
</body>
</html>
