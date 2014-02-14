/***************************************************************
**
**        Developed by the Alliance for Catholic Education
**                at the University of Notre Dame
**
****************************************************************/
$("#HouseholdsListPage").live("pageshow", function()
{
    EnsureSession();
    CurrentHouseholdId = "";
    CurrentContactId = "";
    CiviCRMSearchHouseholds();
});
$("#ViewHouseholdDetailsPage").live("pageshow", function()
{
    EnsureSession();
    if (NeedToReloadContactId != null && CurrentHouseholdId != null && NeedToReloadContactId == CurrentHouseholdId)
    {
        CiviCRMGetHouseholdDetails();
    }
});
$("#EditHouseholdDetailsPage").live("pageshow", function()
{
    EnsureSession();
    CiviCRMEditHouseholdDetails()
});

function CiviCRMSearchHouseholds(forceReload, pageIndex) {
    if (forceReload == true) {
        $("#HouseholdsListPage ul.list_content li").remove();
        pageIndex = 0;
    }

    distanceValue = $('input[name="HHSearchDistanceRadio"]:checked').val();
    if (distanceValue == null || distanceValue == "" || distanceValue == "0") {
        currentPosition = null;
        ProximityRadius = 0;
        CiviCRMGetHouseholdsListFromServer(pageIndex);
    } else {
        if (distanceValue == "-1") {
            ProximityRadius = parseFloat($('#HHSearchDistanceCustomValue').val());
            if (isNaN(ProximityRadius) || ProximityRadius <= 0) {
                alert("Distance should be positive number");
                return;
            }
        } else {
            ProximityRadius = parseInt(distanceValue);
            if (ProximityRadius >= 0 && ProximityRadius < CONTACTS_SEARCH_DISTANCE_OPTIONS.length) {
                ProximityRadius = parseFloat(CONTACTS_SEARCH_DISTANCE_OPTIONS[ProximityRadius].value);
            } else {
                return;
            }
        }

        byAddress = $('#HHSearchNearAddressCheckbox').is(":checked");
        if (byAddress) {
            address = $('#HHSearchNearAddressString').val();
            yahooPlaceFinderGeocode(address, {
                success: function (position) {
                    currentPosition = position;
                    setTimeout('CiviCRMGetHouseholdsListFromServer(' + pageIndex + ');', 10);

                },
                error: function (error) {
                    alert('The position of the address was not found');
                    currentPosition = null;
                    pageIndex = 0;
                    setTimeout('CiviCRMGetHouseholdsListFromServer(0);', 10);
                }
            });

        } else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(

	            function (position) {
	                currentPosition = position;
	                setTimeout('CiviCRMGetHouseholdsListFromServer(' + pageIndex + ');', 10);

	                // Did we get the position correctly?
	                // alert (position.coords.latitude);

	                // To see everything available in the position.coords array:
	                // for (key in position.coords) {alert(key)}

	                //mapServiceProvider(position.coords.latitude,position.coords.longitude);

	            },
            // next function is the error callback
	            function (error) {
	                switch (error.code) {
	                    case error.TIMEOUT:
	                        alert('Error getting the current position. Timeout');
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
	                pageIndex = 0;
	                setTimeout('CiviCRMGetHouseholdsListFromServer(0);', 10);
	            },
	            { timeout: 10000 }
	            );
            //return;
        } else {
            alert('geolocation is not supported by browser');
            CiviCRMGetHouseholdsListFromServer(pageIndex);
        }
    }
    //CiviCRMGetHouseholdListFromServer(HouseholdsListCurrentOffset)
}
function CiviCRMGetHouseholdsListFromServer(pageIndex)
{
    if (pageIndex == null || parseInt(pageIndex) == NaN)
    {
        pageIndex = 0;
    }
    if ($(".ui-page-active ul.list_content li").length === 0 || HouseholdsListCurrentPageIndex !== pageIndex)
    {
        HouseholdsListCurrentPageIndex = pageIndex;

        $.mobile.pageLoading();

        options = {
            contact_type: "Household",
            display_name: '%' + $("#HouseholdsListSearchText").val() + '%',
            rowCount: LIST_ITEMS_ON_PAGE,
            offset: HouseholdsListCurrentPageIndex * LIST_ITEMS_ON_PAGE,
            api_key: API_KEY,
            key: CiviSessionId
        };

        api_method = "get";
        if (currentPosition != null && ProximityRadius > 0) {
            api_method = "proximity";
            options = $.extend({}, options, {
                latitude: currentPosition.coords.latitude,
                longitude: currentPosition.coords.longitude,
                distance: ProximityRadius,
                unit: 'mile'
            });
        }
        $().crmRESTAPI('contact', api_method,
               options,
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
                                   $(".ui-page-active ul.list_content li").remove();

                                   showPrevPageButton = pageIndex > 0;
                                   showNextPageButton = result.count == LIST_ITEMS_ON_PAGE;

                                   if (showPrevPageButton || showNextPageButton)
                                   {
                                       $("#HouseholdsListPageSubMenu").show();
                                       if (showPrevPageButton)
                                       {
                                           $("#HouseholdsListPageSubMenu li>a[b-role=prev_page_button]").show();
                                       } else
                                       {
                                           $("#HouseholdsListPageSubMenu li>a[b-role=prev_page_button]").hide();
                                       }
                                       if (showNextPageButton)
                                       {
                                           $("#HouseholdsListPageSubMenu li>a[b-role=next_page_button]").show();
                                       } else
                                       {
                                           $("#HouseholdsListPageSubMenu li>a[b-role=next_page_button]").hide();
                                       }
                                   } else
                                   {
                                       $("#HouseholdsListPageSubMenu").hide();
                                   }

//                                   if (currentPosition == null)
//                                   {
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
                                                       CurrentHouseholdId = $(this).data("identity");
                                                       CurrentContactId = $(this).data("identity");
                                                       $.mobile.changePage("#ViewHouseholdDetailsPage");
                                                       $.mobile.pageLoading();
                                                       CiviCRMGetHouseholdDetails()
                                                   }
                                               });
                                               d.append(e);
                                               d.append(m);
                                               f.append(d);
                                               $(".ui-page-active ul.list_content").append(f)
                                           }
                                       });
//                                   } else
//                                   {
//                                       $.each(result.values, function(index, value)
//                                       {
//                                           if (typeof value == 'object')
//                                           {
//                                               if (!value.geo_code_1 || !value.geo_code_2) {
//                                                   return;
//                                               } else if (ProximityRadius > 0) {
//                                                   gc1 = parseFloat(value.geo_code_1);
//                                                   gc2 = parseFloat(value.geo_code_2);

//                                                   //if (Math.abs(gc1 - currentPosition.coords.latitude) > GPS_RADIUS || Math.abs(gc2 - currentPosition.coords.longitude) > GPS_RADIUS)
//                                                   //if (gps_distance_mi(currentPosition.coords.latitude, currentPosition.coords.longitude, gc1, gc2) > GPS_RADIUS)
//                                                   if (gps_distance_mi(currentPosition.coords.latitude, currentPosition.coords.longitude, gc1, gc2) > ProximityRadius) {
//                                                       return;
//                                                   }
//                                               }

//                                               f = $("<li/>"),
//                                               e = "<h4>" + value.display_name + "</h4>",
//                                               m = "<p>" + value.contact_type + "</p>";
//                                               d = $("<a/>", {
//                                                   href: "#",
//                                                   "data-identity": value.contact_id,
//                                                   click: function()
//                                                   {
//                                                       CurrentHouseholdId = $(this).data("identity");
//                                                       CurrentContactId = $(this).data("identity");
//                                                       $.mobile.changePage("#ViewHouseholdDetailsPage");
//                                                       $.mobile.pageLoading();
//                                                       CiviCRMGetHouseholdDetails()
//                                                   }
//                                               });
//                                               d.append(e);
//                                               d.append(m);
//                                               f.append(d);
//                                               $(".ui-page-active ul.list_content").append(f)
//                                           }
//                                       });
//                                   }

                                   $(".ui-page-active ul.list_content").listview("refresh");
                                   //$(".ui-page-active div.ui-input-search").find("input").keyup();
                                   //HouseholdsListNextOffset = c.next_offset;
                                   //HouseholdsListPrevOffset = a - RowsPerPageInListViews
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
function CiviCRMGetHouseholdDetails()
{
    $("#HouseholdNameH1").html("");
    $("#HouseholdTitleP").text("");
    $("#ViewHouseholdDetailsPageDetailsList li").remove();

    if (NeedToReloadContactId != null && CurrentHouseholdId != null && NeedToReloadContactId == CurrentHouseholdId)
    {
        NeedToReloadContactId = null;
    }

    //        rest_data: '{"session":"' + CiviSessionId + '","module_name":"Households","id":"' + CurrentHouseholdId + '","select_fields":["first_name","last_name","account_name","title","phone_work","email1","description","primary_address_street","primary_address_city","primary_address_state","primary_address_postalcode","primary_address_country","phone_mobile","phone_fax","department","alt_address_street","alt_address_city","alt_address_state","alt_address_postalcode","alt_address_country"],"link_name_to_fields_array":""}'

    $().crmRESTAPI('contact', 'get',
               {
                   contact_id: CurrentHouseholdId,
                   "api.Note.get": "1",
                   api_key: API_KEY,
                   key: CiviSessionId
               },
               {
                   ajaxURL: SERVER_REST_URL,
                   success: function (result, settings) {
                       if (result) {
                           if (result.is_error == 0) {
                               if (result.values != undefined && result.values != null) {

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

                                   $("#HouseholdNameH1").html(a.display_name);
                                   var c = a.contact_type;
                                   //if (a.name_value_list.account_name != undefined) c += " at " + a.name_value_list.account_name.value;
                                   $("#HouseholdTitleP").text(c);
                                   $("#ViewHouseholdDetailsPageDetailsList").append('<li data-role="list-divider">' + RES_HOUSEHOLD_LABEL + ' Information</li>');
                                   if (a.organization_name !== undefined && a.organization_name !== "") {
                                       c = $("<li/>");
                                       d = "<h4>" + a.organization_name + "</h4>";
                                       c.append("<p><br />Organization Name</p>");
                                       c.append(d);
                                       $("#ViewHouseholdDetailsPageDetailsList").append(c)
                                   }
                                   if (a.first_name !== undefined && a.first_name !== "") {
                                       c = $("<li/>");
                                       d = "<h4>" + a.first_name + "</h4>";
                                       c.append("<p><br />First Name</p>");
                                       c.append(d);
                                       $("#ViewHouseholdDetailsPageDetailsList").append(c)
                                   }
                                   if (a.last_name !== undefined && a.last_name !== "") {
                                       c = $("<li/>");
                                       d = "<h4>" + a.last_name + "</h4>";
                                       c.append("<p><br />Last Name</p>");
                                       c.append(d);
                                       $("#ViewHouseholdDetailsPageDetailsList").append(c)
                                   }
                                   if (a.middle_name !== undefined && a.middle_name !== "") {
                                       c = $("<li/>");
                                       d = "<h4>" + a.middle_name + "</h4>";
                                       c.append("<p><br />Middle Name</p>");
                                       c.append(d);
                                       $("#ViewHouseholdDetailsPageDetailsList").append(c)
                                   }
                                   if (a.individual_prefix !== undefined && a.individual_prefix !== "") {
                                       c = $("<li/>");
                                       d = "<h4>" + a.individual_prefix + "</h4>";
                                       c.append("<p><br />Prefix</p>");
                                       c.append(d);
                                       $("#ViewHouseholdDetailsPageDetailsList").append(c)
                                   }
                                   if (a.individual_suffix !== undefined && a.individual_suffix !== "") {
                                       c = $("<li/>");
                                       d = "<h4>" + a.individual_suffix + "</h4>";
                                       c.append("<p><br />Suffix</p>");
                                       c.append(d);
                                       $("#ViewHouseholdDetailsPageDetailsList").append(c)
                                   }
                                   if (a.nick_name !== undefined && a.nick_name !== "") {
                                       c = $("<li/>");
                                       d = "<h4>" + a.nick_name + "</h4>";
                                       c.append("<p><br />Nick Name</p>");
                                       c.append(d);
                                       $("#ViewHouseholdDetailsPageDetailsList").append(c)
                                   }
                                   if (a.birth_date !== undefined && a.birth_date !== "") {
                                       c = $("<li/>");
                                       d = "<h4>" + a.birth_date + "</h4>";
                                       c.append("<p><br />Birth Date</p>");
                                       c.append(d);
                                       $("#ViewHouseholdDetailsPageDetailsList").append(c)
                                   }
                                   if (a.phone !== undefined && a.phone !== "") {
                                       c = $("<li/>");
                                       var b = a.phone.replace("(", "");
                                       b = b.replace(")", "");
                                       b = b.replace(" ", "");
                                       b = b.replace("-", "");
                                       if (a.phone !== undefined) {
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
                                       $("#ViewHouseholdDetailsPageDetailsList").append(c)
                                   }
                                   if (a.email !== undefined && a.email !== "") {
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
                                       $("#ViewHouseholdDetailsPageDetailsList").append(c)
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
                                       $("#ViewHouseholdDetailsPageDetailsList").append(c)
                                   }
                                   if (a.gender !== undefined && a.gender !== "") {
                                       c = $("<li/>");
                                       d = "<h4>" + a.gender + "</h4>";
                                       c.append("<p><br />Gender</p>");
                                       c.append(d);
                                       $("#ViewHouseholdDetailsPageDetailsList").append(c)
                                   }
                                   if (a.do_not_email !== undefined && a.do_not_email == "1") {
                                       c = $("<li/>");
                                       d = "<h4>Do Not Email</h4>";
                                       c.append(d);
                                       $("#ViewHouseholdDetailsPageDetailsList").append(c)
                                   }
                                   if (a.do_not_mail !== undefined && a.do_not_mail == "1") {
                                       c = $("<li/>");
                                       d = "<h4>Do Not Mail</h4>";
                                       c.append(d);
                                       $("#ViewHouseholdDetailsPageDetailsList").append(c)
                                   }
                                   if (a.do_not_phone !== undefined && a.do_not_phone == "1") {
                                       c = $("<li/>");
                                       d = "<h4>Do Not Phone</h4>";
                                       c.append(d);
                                       $("#ViewHouseholdDetailsPageDetailsList").append(c)
                                   }
                                   if (a.do_not_sms !== undefined && a.do_not_sms == "1") {
                                       c = $("<li/>");
                                       d = "<h4>Do Not SMS</h4>";
                                       c.append(d);
                                       $("#ViewHouseholdDetailsPageDetailsList").append(c)
                                   }
                                   if (a.do_not_trade !== undefined && a.do_not_trade == "1") {
                                       c = $("<li/>");
                                       d = "<h4>Do Not Trade</h4>";
                                       c.append(d);
                                       $("#ViewHouseholdDetailsPageDetailsList").append(c)
                                   }
                                   a.do_not_phone !== undefined && a.do_not_phone == "1" && alert("*NOTE: This Household is marked as Do Not Call.")
                               }
                               $("#ViewHouseholdDetailsPageDetailsList").listview("refresh")
                           }
                           getContactRelatedNotesInsetList(CurrentHouseholdId);
                           getContactRelatedRelationshipsInsetList(CurrentHouseholdId);
                           //getContactRelatedLeadsInsetList();
                           //getContactRelatedCallsInsetList();
                           //getContactRelatedMeetingsInsetList();
                           //getContactRelatedTasksInsetList()
                       }
                       $.mobile.hidePageLoadingMsg();
                   }
               });
}
function CiviCRMEditHouseholdDetails()
{
    $.mobile.showPageLoadingMsg();

    $().crmRESTAPI('contact', 'get',
               {
                   contact_id: CurrentHouseholdId,
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

                                   $("#HHEditPageCiviCRMFirstName").val(a.first_name);
                                   $("#HHEditPageCiviCRMLastName").val(a.last_name);
                                   $("#HHEditPageCiviCRMMiddleName").val(a.middle_name);
                                   $("#HHEditPageCiviCRMNickName").val(a.nick_name);
                                   $("#HHEditPageCiviCRMBirthDate").val(a.birth_date);
                                   $("#HHEditPageCiviCRMGender").val(a.gender_id).selectmenu("refresh"); ;

                                   $("#HHEditPageCiviCRMAddressId").val(a.address_id);
                                   $("#HHEditPageCiviCRMStreet").val(a.street_address);
                                   $("#HHEditPageCiviCRMCity").val(a.city);
                                   $("#HHEditPageCiviCRMState").val(a.state_province_name).selectmenu("refresh"); ;
                                   $("#HHEditPageCiviCRMZip").val(a.postal_code);
                                   $("#HHEditPageCiviCRMCountry").val(a.country);

                                   $("#HHEditPageCiviCRMDoNotPhone").attr("checked", a.do_not_phone == '1').checkboxradio("refresh");
                                   $("#HHEditPageCiviCRMDoNotEmail").attr("checked", a.do_not_email == '1').checkboxradio("refresh");
                                   $("#HHEditPageCiviCRMDoNotMail").attr("checked", a.do_not_mail == '1').checkboxradio("refresh");
                                   $("#HHEditPageCiviCRMDoNotSMS").attr("checked", a.do_not_sms == '1').checkboxradio("refresh");
                                   $("#HHEditPageCiviCRMDoNotTrade").attr("checked", a.do_not_trade == '1').checkboxradio("refresh");
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

function CiviCRMUpdateHouseholdDetails()
{
    $.mobile.showPageLoadingMsg();

    var hHEditPageCiviCRMFirstName = $("#HHEditPageCiviCRMFirstName").val();
    var hHEditPageCiviCRMLastName = $("#HHEditPageCiviCRMLastName").val();
    var hHEditPageCiviCRMMiddleName = $("#HHEditPageCiviCRMMiddleName").val();
    var hHEditPageCiviCRMNickName = $("#HHEditPageCiviCRMNickName").val();
    var hHEditPageCiviCRMBirthDate = $("#HHEditPageCiviCRMBirthDate").val();
    var hHEditPageCiviCRMGender = $("#HHEditPageCiviCRMGender").val();

    var hHEditPageCiviCRMAddressId = $("#HHEditPageCiviCRMAddressId").val();
    var hHEditPageCiviCRMStreet = $("#HHEditPageCiviCRMStreet").val();
    var hHEditPageCiviCRMCity = $("#HHEditPageCiviCRMCity").val();
    var hHEditPageCiviCRMState = $("#HHEditPageCiviCRMState").val();
    var hHEditPageCiviCRMZip = $("#HHEditPageCiviCRMZip").val();
    var hHEditPageCiviCRMCountry = $("#HHEditPageCiviCRMCountry").val();

    var hHEditPageCiviCRMNotPhone = $("#HHEditPageCiviCRMDoNotPhone").is(":checked");
    var hHEditPageCiviCRMNotEmail = $("#HHEditPageCiviCRMDoNotEmail").is(":checked");
    var hHEditPageCiviCRMNotMail = $("#HHEditPageCiviCRMDoNotMail").is(":checked");
    var hHEditPageCiviCRMNotSMS = $("#HHEditPageCiviCRMDoNotSMS").is(":checked");
    var hHEditPageCiviCRMNotTrade = $("#HHEditPageCiviCRMDoNotTrade").is(":checked");

    $().crmRESTAPI_POST('contact', 'update',
               {
                   id: CurrentHouseholdId,
                   first_name: hHEditPageCiviCRMFirstName,
                   last_name: hHEditPageCiviCRMLastName,
                   middle_name: hHEditPageCiviCRMMiddleName,
                   nick_name: hHEditPageCiviCRMNickName,
                   birth_date: hHEditPageCiviCRMBirthDate,
                   gender_id: hHEditPageCiviCRMGender,
                   "api.address.create": {
                       id: hHEditPageCiviCRMAddressId,
                       street_address: hHEditPageCiviCRMStreet,
                       city: hHEditPageCiviCRMCity,
                       state_province_name: hHEditPageCiviCRMState,
                       postal_code: hHEditPageCiviCRMZip,
                       country: hHEditPageCiviCRMCountry
                   },
                   do_not_phone: hHEditPageCiviCRMNotPhone ? "1" : "0",
                   do_not_email: hHEditPageCiviCRMNotEmail ? "1" : "0",
                   do_not_mail: hHEditPageCiviCRMNotMail ? "1" : "0",
                   do_not_sms: hHEditPageCiviCRMNotSMS ? "1" : "0",
                   do_not_trade: hHEditPageCiviCRMNotTrade ? "1" : "0",

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

                               $("#HouseholdsListPage ul.list_content li").remove();

                               $("#EditHouseholdDetailsPage a[data-rel=back]").trigger("click");
                               //$.mobile.changePage("#ViewHouseholdDetailsPage");
                               $.mobile.pageLoading();
                               CiviCRMGetHouseholdDetails()
                           }
                       } else
                       {
                           alert("An unexpected error occurred during requesting data.");
                       }
                       $.mobile.hidePageLoadingMsg();
                   }
               });
}
