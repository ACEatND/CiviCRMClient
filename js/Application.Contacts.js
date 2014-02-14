/***************************************************************
**
**        Developed by the Alliance for Catholic Education
**                at the University of Notre Dame
**
****************************************************************/
$("#ViewContactDetailsPage").live("pageshow", function () {
    EnsureSession();
    if (NeedToReloadContactId != null && parseInt(NeedToReloadContactId) != NaN) {
        viewContactId = $("#ViewContactDetailsPageCiviCRMContactId").val();
        if (viewContactId != null && parseInt(viewContactId) != NaN) {
            viewContactId = parseInt(viewContactId);
            if (viewContactId > 0 && parseInt(NeedToReloadContactId) == viewContactId) {
                CiviCRMGetContactDetails(viewContactId);
            }
        }
    }
});

function CiviCRMSearchContacts(contactType, forceReload)
{
    if (forceReload == true)
    {
        $("#IndividualsListPage ul.list_content li[b-role!=search_options]").remove();
    }

    distanceValue = $('input[name="IndSearchDistanceRadio"]:checked').val();
    if (distanceValue == null || distanceValue == "" || distanceValue == "0")
    {
        currentPosition = null;
        ProximityRadius = 0;
        CiviCRMGetIndividualsListFromServer(IndividualsListCurrentOffset);
    } else if (navigator.geolocation)
    {
        if (distanceValue == "-1")
        {
            ProximityRadius = parseFloat($('#IndSearchDistanceCustomValue').val());
            if (isNaN(ProximityRadius) || ProximityRadius <= 0)
            {
                alert("Distance should be positive number");
                return;
            }
        } else
        {
            ProximityRadius = parseInt(distanceValue);
            if (ProximityRadius >= 0 && ProximityRadius < CONTACTS_SEARCH_DISTANCE_OPTIONS.length)
            {
                ProximityRadius = parseFloat(CONTACTS_SEARCH_DISTANCE_OPTIONS[ProximityRadius].value);
            } else
            {
                return;
            }
        }
        navigator.geolocation.getCurrentPosition(

	        function(position)
	        {
	            currentPosition = position;
	            setTimeout('CiviCRMGetIndividualsListFromServer(0);', 10);

	            // Did we get the position correctly?
	            // alert (position.coords.latitude);

	            // To see everything available in the position.coords array:
	            // for (key in position.coords) {alert(key)}

	            //mapServiceProvider(position.coords.latitude,position.coords.longitude);

	        },
        // next function is the error callback
	        function(error)
	        {
	            switch (error.code)
	            {
	                case error.TIMEOUT:
	                    alert('Error getting the current position. Timeout.');
	                    break;
	                case error.POSITION_UNAVAILABLE:
	                    alert('Error getting the current position. Position unavailable');
	                    break;
	                case error.PERMISSION_DENIED:
	                    alert('Error getting the current position. Permission denied');
	                    break;
	                case error.UNKNOWN_ERROR:
	                    alert('Error getting the current position. Unknown error');
	                    break;
	            }
	            currentPosition = null;
	            setTimeout('CiviCRMGetIndividualsListFromServer(0);', 10);
	        },
	        { timeout: 10000 }
	        );
        //return;
    } else
    {
        alert('geolocation is not supported by browser');
        CiviCRMGetIndividualsListFromServer(IndividualsListCurrentOffset);
    }

    //CiviCRMGetIndividualsListFromServer(IndividualsListCurrentOffset)
}

function CiviCRMGetContactsListFromServer(contactType, a)
{
    if ($(".ui-page-active ul.list_content li[b-role!=search_options]").length === 0 || IndividualsListCurrentOffset !== a)
    {
        IndividualsListCurrentOffset = a;

        $.mobile.pageLoading();
//$.mobile.hidePageLoadingMsg();
        /*
        contact_type: {
        IN: ["Individual", "Household"] 
        },
        contact_type: "Individual",

        */
        $().crmRESTAPI('contact', 'get',
               {
                   contact_type: "Individual",
                   api_key: API_KEY,
                   key: CiviSessionId
               },
               {
                   ajaxURL: SERVER_REST_URL,
                   success: function(result, settings)
                   {
                       if (result)
                       {
                           if (result.is_error == 0)
                           {
                               if (result.values != undefined)
                               {
                                   /*
                                   if (result.result_count === 0) IndividualsListCurrentOffset = IndividualsListPrevOffset + RowsPerPageInListViews;
                                   else if (result.next_offset === 0) IndividualsListCurrentOffset = 0;
                                   if (result.next_offset == 0 || result.result_count == 0) alert("There are no more records in that direction");
                                   else {
                                   */
                                   $(".ui-page-active ul.list_content li[b-role!=search_options]").remove();
                                   if (currentPosition == null)
                                   {
                                       $.each(result.values, function(index, value)
                                       {
                                           if (typeof value == 'object')
                                           {

                                               value.display_name = ensure_string(value.display_name);
                                               value.contact_type = ensure_string(value.contact_type);

                                               f = $("<li/>"),
                                               e = "<h4>" + value.display_name + "</h4>",
                                               m = "<p>" + value.contact_type + "</p>";
                                               d = $("<a/>", {
                                                   href: "#",
                                                   "data-identity": value.contact_id,
                                                   click: function()
                                                   {
                                                       CurrentIndividualId = $(this).data("identity");
                                                       CurrentContactId = $(this).data("identity");
                                                       $.mobile.changePage("#ViewIndividualDetailsPage");
                                                       $.mobile.pageLoading();
                                                       CiviCRMGetIndividualDetails()
                                                   }
                                               });
                                               d.append(e);
                                               d.append(m);
                                               f.append(d);
                                               $(".ui-page-active ul.list_content").append(f)
                                           }
                                       });
                                   } else
                                   {
                                       $.each(result.values, function(index, value)
                                       {
                                           if (typeof value == 'object')
                                           {
                                               if (value.geo_code_1 && value.geo_code_2 && ProximityRadius > 0)
                                               {
                                                   gc1 = parseFloat(value.geo_code_1);
                                                   gc2 = parseFloat(value.geo_code_2);

                                                   //if (Math.abs(gc1 - currentPosition.coords.latitude) > GPS_RADIUS || Math.abs(gc2 - currentPosition.coords.longitude) > GPS_RADIUS)
                                                   //if (gps_distance_mi(currentPosition.coords.latitude, currentPosition.coords.longitude, gc1, gc2) > GPS_RADIUS)
                                                   if (gps_distance_mi(currentPosition.coords.latitude, currentPosition.coords.longitude, gc1, gc2) > ProximityRadius)
                                                   {
                                                       return;
                                                   }
                                               }

                                               value.display_name = ensure_string(value.display_name);
                                               value.contact_type = ensure_string(value.contact_type);

                                               f = $("<li/>"),
                                               e = "<h4>" + value.display_name + "</h4>",
                                               m = "<p>" + value.contact_type + "</p>";
                                               d = $("<a/>", {
                                                   href: "#",
                                                   "data-identity": value.contact_id,
                                                   click: function()
                                                   {
                                                       CurrentIndividualId = $(this).data("identity");
                                                       CurrentContactId = $(this).data("identity");
                                                       $.mobile.changePage("#ViewIndividualDetailsPage");
                                                       $.mobile.pageLoading();
$.mobile.hidePageLoadingMsg();
                                                       CiviCRMGetIndividualDetails()
                                                   }
                                               });
                                               d.append(e);
                                               d.append(m);
                                               f.append(d);
                                               $(".ui-page-active ul.list_content").append(f)
                                           }
                                       });
                                   }

                                   $(".ui-page-active ul.list_content").listview("refresh");
                                   //IndividualsListNextOffset = c.next_offset;
                                   //IndividualsListPrevOffset = a - RowsPerPageInListViews
                                   //}
                               }
                           }
                       } else
                       {
                           alert("An unexpected error occurred.");
                       }
                       $.mobile.hidePageLoadingMsg();
                   }
               });
    }
}

function CiviCRMGetContactDetails(contact_id)
{
    $("#ContactNameH1").html("");
    $("#ContactTitleP").text("");
    $("#ViewContactDetailsPageDetailsList li").remove();

    if (NeedToReloadContactId != null && contact_id != null && NeedToReloadContactId == contact_id)
    {
        NeedToReloadContactId = null;
    }
    $("#ViewContactDetailsPageCiviCRMContactId").val(contact_id);

    $().crmRESTAPI('contact', 'get',
               {
                   contact_id: contact_id,
                   "api.Note.get": 1,
                   api_key: API_KEY,
                   key: CiviSessionId
               },
               {
                   ajaxURL: SERVER_REST_URL,
                   success: function(result, settings)
                   {
                       if (result)
                       {
                           if (result.is_error == 0)
                           {
                               if (result.values != undefined && result.values != null)
                               {

                                   a = result.values[result.id];

                                   a.contact_type = ensure_string(a.contact_type);
                                   a.organization_name = ensure_string(a.organization_name);
                                   a.first_name = ensure_string(a.first_name);
                                   a.last_name = ensure_string(a.last_name);
                                   a.middle_name = ensure_string(a.middle_name);
                                   a.individual_prefix = ensure_string(a.individual_prefix);
                                   a.nick_name = ensure_string(a.nick_name);
                                   a.birth_date = ensure_string(a.birth_date);
                                   a.phone = ensure_string(a.phone);
                                   a.email = ensure_string(a.email);
                                   a.street_address = ensure_string(a.street_address);
                                   a.supplemental_address_1 = ensure_string(a.supplemental_address_1);
                                   a.supplemental_address_2 = ensure_string(a.supplemental_address_2);
                                   a.city = ensure_string(a.city);
                                   a.postal_code = ensure_string(a.postal_code);
                                   a.state_province_name = ensure_string(a.state_province_name);
                                   a.country = ensure_string(a.country);
                                   a.gender = ensure_string(a.gender);
                                   a.do_not_email = ensure_string(a.do_not_email);
                                   a.do_not_mail = ensure_string(a.do_not_mail);
                                   a.do_not_phone = ensure_string(a.do_not_phone);
                                   a.do_not_sms = ensure_string(a.do_not_sms);
                                   a.do_not_trade = ensure_string(a.do_not_trade);

                                   //contact_type_name = C_CONTACT_TYPE_NAMES[a.contact_type_id];

                                   $("#ContactNameH1").html(a.display_name);
                                   var c = a.contact_type;
                                   //if (a.name_value_list.account_name != undefined) c += " at " + a.name_value_list.account_name.value;
                                   $("#ContactTitleP").text(c);
                                   $("#ViewContactDetailsPageDetailsList").append('<li data-role="list-divider">' + a.contact_type + ' Information</li>');
                                   if (a.organization_name !== undefined && a.organization_name !== "")
                                   {
                                       c = $("<li/>");
                                       d = "<h4>" + a.organization_name + "</h4>";
                                       c.append("<p><br />Organization Name</p>");
                                       c.append(d);
                                       $("#ViewContactDetailsPageDetailsList").append(c)
                                   }
                                   if (a.first_name !== undefined && a.first_name !== "")
                                   {
                                       c = $("<li/>");
                                       d = "<h4>" + a.first_name + "</h4>";
                                       c.append("<p><br />First Name</p>");
                                       c.append(d);
                                       $("#ViewContactDetailsPageDetailsList").append(c)
                                   }
                                   if (a.last_name !== undefined && a.last_name !== "")
                                   {
                                       c = $("<li/>");
                                       d = "<h4>" + a.last_name + "</h4>";
                                       c.append("<p><br />Last Name</p>");
                                       c.append(d);
                                       $("#ViewContactDetailsPageDetailsList").append(c)
                                   }
                                   if (a.middle_name !== undefined && a.middle_name !== "")
                                   {
                                       c = $("<li/>");
                                       d = "<h4>" + a.middle_name + "</h4>";
                                       c.append("<p><br />Middle Name</p>");
                                       c.append(d);
                                       $("#ViewContactDetailsPageDetailsList").append(c)
                                   }
                                   if (a.individual_prefix !== undefined && a.individual_prefix !== "")
                                   {
                                       c = $("<li/>");
                                       d = "<h4>" + a.individual_prefix + "</h4>";
                                       c.append("<p><br />Prefix</p>");
                                       c.append(d);
                                       $("#ViewContactDetailsPageDetailsList").append(c)
                                   }
                                   if (a.individual_suffix !== undefined && a.individual_suffix !== "")
                                   {
                                       c = $("<li/>");
                                       d = "<h4>" + a.individual_suffix + "</h4>";
                                       c.append("<p><br />Suffix</p>");
                                       c.append(d);
                                       $("#ViewContactDetailsPageDetailsList").append(c)
                                   }
                                   if (a.nick_name !== undefined && a.nick_name !== "")
                                   {
                                       c = $("<li/>");
                                       d = "<h4>" + a.nick_name + "</h4>";
                                       c.append("<p><br />Nick Name</p>");
                                       c.append(d);
                                       $("#ViewContactDetailsPageDetailsList").append(c)
                                   }
                                   if (a.birth_date !== undefined && a.birth_date !== "")
                                   {
                                       c = $("<li/>");
                                       d = "<h4>" + a.birth_date + "</h4>";
                                       c.append("<p><br />Birth Date</p>");
                                       c.append(d);
                                       $("#ViewContactDetailsPageDetailsList").append(c)
                                   }
                                   if (a.phone !== undefined && a.phone !== "")
                                   {
                                       c = $("<li/>");
                                       var b = a.phone.replace("(", "");
                                       b = b.replace(")", "");
                                       b = b.replace(" ", "");
                                       b = b.replace("-", "");
                                       if (a.phone !== undefined)
                                       {
                                           var d = "<h4>" + a.phone + "</h4>",
						                    f = $("<a/>", {
						                        href: "tel:+1" + b,
						                        rel: "external",
						                        style: "text-decoration:none;color:#444;"
						                    });
                                           f.append("<p><br />Phone</p>");
                                           f.append(d);
                                           c.append(f)
                                       }
                                       $("#ViewContactDetailsPageDetailsList").append(c)
                                   }
                                   if (a.email !== undefined && a.email !== "")
                                   {
                                       c = $("<li/>");
                                       d = "<h4>" + a.email + "</h4>";
                                       f = $("<a/>", {
                                           href: "mailto:" + a.email,
                                           rel: "external",
                                           style: "text-decoration:none;color:#444;"
                                       });
                                       f.append("<p><br />Email</p>");
                                       f.append(d);
                                       c.append(f);
                                       $("#ViewContactDetailsPageDetailsList").append(c)
                                   }
                                   street_address = (a.street_address === undefined || trim(a.street_address) == "") ? "" : a.street_address;
                                   supplemental_address_1 = (a.supplemental_address_1 === undefined || trim(a.supplemental_address_1) == "") ? "" : a.supplemental_address_1;
                                   supplemental_address_2 = (a.supplemental_address_2 === undefined || trim(a.supplemental_address_2) == "") ? "" : a.supplemental_address_2;
                                   f = trim(street_address + " " + supplemental_address_1 + " " + supplemental_address_2);

                                   a.city = (a.city === undefined || trim(a.city) == "") ? "" : a.city;
                                   a.postal_code = (a.postal_code === undefined || trim(a.postal_code) == "") ? "" : a.postal_code;
                                   a.state_province_name = (a.state_province_name === undefined || trim(a.state_province_name) == "") ? "" : a.state_province_name;
                                   a.country = (a.country === undefined || trim(a.country) == "") ? "" : a.country;
                                   if (f != ""
                                            || a.city !== undefined && a.city != ""
                                            || a.postal_code !== undefined && a.postal_code != ""
                                            || a.state_province_name !== undefined && a.state_province_name != ""
                                            || a.country !== undefined && a.country != "") {
                                       var e = (a.city === undefined || trim(a.city) == "") ? "" : a.city;
                                       var m = (a.state_province_name === undefined || trim(a.state_province_name) == "") ? "" : a.state_province_name;
                                       var g = (a.postal_code === undefined || trim(a.postal_code) == "") ? "" : a.postal_code;
                                       var i = (a.country === undefined || trim(a.country) == "") ? "" : a.country;
                                       /*
                                       var e = a.city,
                                       m = a.state_province_name,
                                       g = a.postal_code,
                                       i = a.country;
                                       */
                                       d = "http://maps.google.com/?q=" + f + " " + e + " " + m + " " + g + "&t=m&z=13";
                                       f = f == "" ? "" : f + "<br />";
                                       i = i == "" ? "" : "<br />" + i;
                                       c = $("<li/>");
                                       f = "<h4>" + f + e + ", " + m + " " + g + i + "</h4>";
                                       d = $("<a/>", {
                                           href: d,
                                           rel: "external",
                                           target: "_new",
                                           style: "text-decoration:none;color:#444;"
                                       });
                                       d.append("<p><br />Address</p>");
                                       d.append(f);
                                       c.append(d);
                                       $("#ViewContactDetailsPageDetailsList").append(c)
                                   }
                                   if (a.gender !== undefined && a.gender !== "")
                                   {
                                       c = $("<li/>");
                                       d = "<h4>" + a.gender + "</h4>";
                                       c.append("<p><br />Gender</p>");
                                       c.append(d);
                                       $("#ViewContactDetailsPageDetailsList").append(c)
                                   }
                                   if (a.do_not_email !== undefined && a.do_not_email == "1")
                                   {
                                       c = $("<li/>");
                                       d = "<h4>Do Not Email</h4>";
                                       c.append(d);
                                       $("#ViewContactDetailsPageDetailsList").append(c)
                                   }
                                   if (a.do_not_mail !== undefined && a.do_not_mail == "1")
                                   {
                                       c = $("<li/>");
                                       d = "<h4>Do Not Mail</h4>";
                                       c.append(d);
                                       $("#ViewContactDetailsPageDetailsList").append(c)
                                   }
                                   if (a.do_not_phone !== undefined && a.do_not_phone == "1")
                                   {
                                       c = $("<li/>");
                                       d = "<h4>Do Not Phone</h4>";
                                       c.append(d);
                                       $("#ViewContactDetailsPageDetailsList").append(c)
                                   }
                                   if (a.do_not_sms !== undefined && a.do_not_sms == "1")
                                   {
                                       c = $("<li/>");
                                       d = "<h4>Do Not SMS</h4>";
                                       c.append(d);
                                       $("#ViewContactDetailsPageDetailsList").append(c)
                                   }
                                   if (a.do_not_trade !== undefined && a.do_not_trade == "1")
                                   {
                                       c = $("<li/>");
                                       d = "<h4>Do Not Trade</h4>";
                                       c.append(d);
                                       $("#ViewContactDetailsPageDetailsList").append(c)
                                   }
                                   a.do_not_phone !== undefined && a.do_not_phone == "1" && alert("*NOTE: This " + a.contact_type + " is marked as Do Not Call.")
                               }
                               $("#ViewContactDetailsPageDetailsList").listview("refresh")
                           }
                           getContactRelatedNotesInsetList(result.id);
                           getContactRelatedRelationshipsInsetList(result.id);
                           //getContactRelatedLeadsInsetList();
                           //getContactRelatedCallsInsetList();
                           //getContactRelatedMeetingsInsetList();
                           //getContactRelatedTasksInsetList()
                       }
                       $.mobile.hidePageLoadingMsg();
                   }
               });
}

function CiviCRMNewContact(contact_type)
{
    $("#EditContactDetailsPageH1").val("New " + contact_type);

    ShowContactEditBoxes(contact_type);

    $("#ContactEditPageCiviCRMContactId").val("0");
    $("#ContactEditPageCiviCRMContactType").val(contact_type);

    $("#ContactEditPageCiviCRMOrganizationName").val("");
    $("#ContactEditPageCiviCRMHouseholdName").val("");
    $("#ContactEditPageCiviCRMLegalName").val("");
    $("#ContactEditPageCiviCRMSicCode").val("");

    $("#ContactEditPageCiviCRMFirstName").val("");
    $("#ContactEditPageCiviCRMLastName").val("");
    $("#ContactEditPageCiviCRMMiddleName").val("");
    $("#ContactEditPageCiviCRMNickName").val("");
    $("#ContactEditPageCiviCRMBirthDate").val("");
    $("#ContactEditPageCiviCRMGender").val("").selectmenu("refresh"); ;

    $("#ContactEditPageCiviCRMAddressId").val("");
    $("#ContactEditPageCiviCRMStreet").val("");
    $("#ContactEditPageCiviCRMCity").val("");
    $("#ContactEditPageCiviCRMState").val("").selectmenu("refresh"); ;
    $("#ContactEditPageCiviCRMZip").val("");
    $("#ContactEditPageCiviCRMCountry").val("");

    $("#ContactEditPageCiviCRMDoNotPhone").attr("checked", false).checkboxradio("refresh");
    $("#ContactEditPageCiviCRMDoNotEmail").attr("checked", false).checkboxradio("refresh");
    $("#ContactEditPageCiviCRMDoNotMail").attr("checked", false).checkboxradio("refresh");
    $("#ContactEditPageCiviCRMDoNotSMS").attr("checked", false).checkboxradio("refresh");
    $("#ContactEditPageCiviCRMDoNotTrade").attr("checked", false).checkboxradio("refresh");
}

function CiviCRMEditContactDetails(contact_id)
{
    $.mobile.showPageLoadingMsg();

    $().crmRESTAPI('contact', 'get',
               {
                   contact_id: contact_id,
                   api_key: API_KEY,
                   key: CiviSessionId
               },
               {
                   ajaxURL: SERVER_REST_URL,
                   success: function(result, settings)
                   {
                       if (result)
                       {
                           if (result.is_error == 0)
                           {
                               if (result.values != undefined && result.values != null)
                               {
                                   a = result.values[result.id];
                                   ShowContactEditBoxes(contact_type);

                                   a.contact_type = ensure_string(a.contact_type);
                                   a.organization_name = ensure_string(a.organization_name);
                                   a.legal_name = ensure_string(a.legal_name);
                                   a.sic_code = ensure_string(a.sic_code);
                                   a.first_name = ensure_string(a.first_name);
                                   a.last_name = ensure_string(a.last_name);
                                   a.middle_name = ensure_string(a.middle_name);
                                   a.individual_prefix = ensure_string(a.individual_prefix);
                                   a.nick_name = ensure_string(a.nick_name);
                                   a.birth_date = ensure_string(a.birth_date);
                                   a.phone = ensure_string(a.phone);
                                   a.email = ensure_string(a.email);
                                   a.street_address = ensure_string(a.street_address);
                                   a.supplemental_address_1 = ensure_string(a.supplemental_address_1);
                                   a.supplemental_address_2 = ensure_string(a.supplemental_address_2);
                                   a.city = ensure_string(a.city);
                                   a.postal_code = ensure_string(a.postal_code);
                                   a.state_province_name = ensure_string(a.state_province_name);
                                   a.country = ensure_string(a.country);
                                   a.gender = ensure_string(a.gender);
                                   a.do_not_email = ensure_string(a.do_not_email);
                                   a.do_not_mail = ensure_string(a.do_not_mail);
                                   a.do_not_phone = ensure_string(a.do_not_phone);
                                   a.do_not_sms = ensure_string(a.do_not_sms);
                                   a.do_not_trade = ensure_string(a.do_not_trade);

                                   $("#ContactEditPageCiviCRMContactId").val(a.id);
                                   $("#ContactEditPageCiviCRMContactType").val(a.contact_type);

                                   switch (contact_type.toLowerCase())
                                   {
                                       case "organization":
                                           $("#ContactEditPageCiviCRMOrganizationName").val(a.organization_name);
                                           $("#ContactEditPageCiviCRMLegalName").val(a.legal_name);
                                           $("#ContactEditPageCiviCRMSicCode").val(a.sic_code);
                                           break;

                                       case "individual":
                                           $("#ContactEditPageCiviCRMFirstName").val(a.first_name);
                                           $("#ContactEditPageCiviCRMLastName").val(a.last_name);
                                           $("#ContactEditPageCiviCRMMiddleName").val(a.middle_name);
                                           $("#ContactEditPageCiviCRMBirthDate").val(a.birth_date);
                                           $("#ContactEditPageCiviCRMGender").val(a.gender_id).selectmenu("refresh"); ;
                                           break;

                                       case "household":
                                           $("#ContactEditPageCiviCRMHouseholdName").val(a.household_name);
                                           break;
                                   }

                                   $("#ContactEditPageCiviCRMNickName").val(a.nick_name);
                                   $("#ContactEditPageCiviCRMAddressId").val(a.address_id);
                                   $("#ContactEditPageCiviCRMStreet").val(a.street_address);
                                   $("#ContactEditPageCiviCRMCity").val(a.city);
                                   $("#ContactEditPageCiviCRMState").val(a.state_province_name).selectmenu("refresh"); ;
                                   $("#ContactEditPageCiviCRMZip").val(a.postal_code);
                                   $("#ContactEditPageCiviCRMCountry").val(a.country);

                                   $("#ContactEditPageCiviCRMDoNotPhone").attr("checked", a.do_not_phone == '1').checkboxradio("refresh");
                                   $("#ContactEditPageCiviCRMDoNotEmail").attr("checked", a.do_not_email == '1').checkboxradio("refresh");
                                   $("#ContactEditPageCiviCRMDoNotMail").attr("checked", a.do_not_mail == '1').checkboxradio("refresh");
                                   $("#ContactEditPageCiviCRMDoNotSMS").attr("checked", a.do_not_sms == '1').checkboxradio("refresh");
                                   $("#ContactEditPageCiviCRMDoNotTrade").attr("checked", a.do_not_trade == '1').checkboxradio("refresh");
                               }
                           }
                       } else
                       {
                           alert("An unexpected error occurred during sending data.");
                       }
                       $.mobile.hidePageLoadingMsg();
                   }
               });
}

function CiviCRMUpdateContactDetails(contact_id)
{
    $.mobile.showPageLoadingMsg();

    var contactEditPageCiviCRMContactId = $("#ContactEditPageCiviCRMContactId").val();
    var contactEditPageCiviCRMContactType = $("#ContactEditPageCiviCRMContactType").val();

    var contactEditPageCiviCRMOrganizationName = $("#ContactEditPageCiviCRMOrganizationName").val();
    var contactEditPageCiviCRMLegalName = $("#ContactEditPageCiviCRMLegalName").val();
    var contactEditPageCiviCRMSicCode = $("#ContactEditPageCiviCRMSicCode").val();

    var contactEditPageCiviCRMHouseholdName = $("#ContactEditPageCiviCRMHouseholdName").val();

    var contactEditPageCiviCRMFirstName = $("#ContactEditPageCiviCRMFirstName").val();
    var contactEditPageCiviCRMLastName = $("#ContactEditPageCiviCRMLastName").val();
    var contactEditPageCiviCRMMiddleName = $("#ContactEditPageCiviCRMMiddleName").val();
    var contactEditPageCiviCRMBirthDate = $("#ContactEditPageCiviCRMBirthDate").val();
    var contactEditPageCiviCRMGender = $("#ContactEditPageCiviCRMGender").val();

    var contactEditPageCiviCRMNickName = $("#ContactEditPageCiviCRMNickName").val();

    var contactEditPageCiviCRMAddressId = $("#ContactEditPageCiviCRMAddressId").val();
    var contactEditPageCiviCRMStreet = $("#ContactEditPageCiviCRMStreet").val();
    var contactEditPageCiviCRMCity = $("#ContactEditPageCiviCRMCity").val();
    var contactEditPageCiviCRMState = $("#ContactEditPageCiviCRMState").val();
    var contactEditPageCiviCRMZip = $("#ContactEditPageCiviCRMZip").val();
    var contactEditPageCiviCRMCountry = $("#ContactEditPageCiviCRMCountry").val();

    var contactEditPageCiviCRMNotPhone = $("#ContactEditPageCiviCRMDoNotPhone").is(":checked");
    var contactEditPageCiviCRMNotEmail = $("#ContactEditPageCiviCRMDoNotEmail").is(":checked");
    var contactEditPageCiviCRMNotMail = $("#ContactEditPageCiviCRMDoNotMail").is(":checked");
    var contactEditPageCiviCRMNotSMS = $("#ContactEditPageCiviCRMDoNotSMS").is(":checked");
    var contactEditPageCiviCRMNotTrade = $("#ContactEditPageCiviCRMDoNotTrade").is(":checked");

    var params = {
        contact_type: contactEditPageCiviCRMContactType,
        nick_name: contactEditPageCiviCRMNickName,
        "api.address.create": {
            is_primary: 1,
            sequential: 1,
            location_type_id: 1,
            //id: contactEditPageCiviCRMAddressId,
            street_address: contactEditPageCiviCRMStreet,
            city: contactEditPageCiviCRMCity,
            state_province_id: contactEditPageCiviCRMState,
            postal_code: contactEditPageCiviCRMZip,
            country: contactEditPageCiviCRMCountry
        },
        do_not_phone: contactEditPageCiviCRMNotPhone ? "1" : "0",
        do_not_email: contactEditPageCiviCRMNotEmail ? "1" : "0",
        do_not_mail: contactEditPageCiviCRMNotMail ? "1" : "0",
        do_not_sms: contactEditPageCiviCRMNotSMS ? "1" : "0",
        do_not_trade: contactEditPageCiviCRMNotTrade ? "1" : "0",

        api_key: API_KEY,
        key: CiviSessionId
    };
    switch (contactEditPageCiviCRMContactType.toLowerCase())
    {
        case "organization":
            params = $.extend({}, params, {
                organization_name: contactEditPageCiviCRMFirstName,
                legal_name: contactEditPageCiviCRMLegalName,
                sic_code: contactEditPageCiviCRMSicCode
            });
            break;

        case "individual":
            params = $.extend({}, params, {
                first_name: contactEditPageCiviCRMFirstName,
                last_name: contactEditPageCiviCRMLastName,
                middle_name: contactEditPageCiviCRMMiddleName,
                birth_date: contactEditPageCiviCRMBirthDate,
                gender_id: contactEditPageCiviCRMGender
            });
            break;

        case "household":
            params = $.extend({}, params, {
                household_name: contactEditPageCiviCRMHouseholdName
            });
            break;
    }
    if (contactEditPageCiviCRMContactId != null && contactEditPageCiviCRMContactId != "")
    {
        contactEditPageCiviCRMContactId = parseInt(contactEditPageCiviCRMContactId);
        if (contactEditPageCiviCRMContactId != NaN && contactEditPageCiviCRMContactId > 0)
        {
            params = $.extend({}, params, { id: contactEditPageCiviCRMContactId });
            params["api.address.create"] = $.extend({},params["api.address.create"], { contact_id: contactEditPageCiviCRMContactId });
        }
    }

    $().crmRESTAPI_POST('contact', 'create',
               params,
               {
                   ajaxURL: SERVER_REST_URL,
                   contact_type: contactEditPageCiviCRMContactType,
                   success: function(result, settings)
                   {
                       if (result)
                       {
                           if (result.is_error == 0)
                           {
                               $("#" + settings.contact_type + "sListPage ul.list_content li[b-role!=search_options]").remove();

                               $("#EditContactDetailsPage a[data-rel=back]").trigger("click");

                               //$.mobile.changePage("#ViewIndividualDetailsPage");
                               $.mobile.pageLoading();
                               CiviCRMGetIndividualDetails()
                           }
                       } else
                       {
                           alert("An unexpected error occurred during requesting data.");
                       }
                       $.mobile.hidePageLoadingMsg();
                   }
               });
}

function ShowContactEditBoxes(contact_type)
{
    $("#EditContactDetailsPage div[data-role='content'] div").hide();
    switch (contact_type.toLowerCase())
    {
        case "organization":
            $("#EditContactDetailsPage div[data-role='content'] div[b-role*='O']").show();
            break;

        case "individual":
            $("#EditContactDetailsPage div[data-role='content'] div[b-role*='I']").show();
            break;

        case "household":
            $("#EditContactDetailsPage div[data-role='content'] div[b-role*='H']").show();
            break;
    }
}
