/*****************************************************************************
 * FILE: mch_bridge MAIN JS
 * DATE: 03/16/22  
 * AUTHOR: Giovanni Romero
 * COPYRIGHT:
 * LICENSE:
 *****************************************************************************/

/*****************************************************************************
 *                      LIBRARY WRAPPER
 *****************************************************************************/

 var LIBRARY_OBJECT = (function() {
    // Wrap the library in a package function
    "use strict"; // And enable strict mode for this library

    /************************************************************************
     *                      MODULE LEVEL / GLOBAL VARIABLES
     *************************************************************************/
    var public_interface;


    /************************************************************************
     *                    PRIVATE FUNCTION DECLARATIONS
     *************************************************************************/
    var getCookie,
        upload_data,
        startWS,
        sendNotification,
        notification_ws;
		// Object returned by the module



    /************************************************************************
     *                    PRIVATE FUNCTION IMPLEMENTATIONS
     *************************************************************************/
     sendNotification = function (message, n_content){
        // let new_element = `<div style="display: none;" id="install_notif_${notifCount}">${message}</div>`
        if (message == "Upload complete") {
            console.log('complete');
            // new_element = `<div style="display: none;" id="install_notif_${notifCount}">Install Complete. Restarting Server for changes to take effect.</div>`
            // notification_ws.send(
            //     JSON.stringify({
            //         data: { ...installData, restart_type: "install" },
            //         type: `restart_server`
            //     })
            // )
            // resetInstallStatus()
        }
        if (message == "Uploading in process...") {
            console.log('in process...');
        //    notification_ws.send(
        //         JSON.stringify({
        //             data: { ...uninstallData, restart_type: "uninstall" },
        //             type: `restart_server`
        //         })
        //     )
        }
        if(message == "Uploading failed"){
            console.log('failed');

        }
       
    }
    startWS =  function(websocketServerLocation){
        notification_ws = new WebSocket(websocketServerLocation)
        notification_ws.onopen = () => {
            console.log("WebSocket is Open")

        }
    
        notification_ws.onmessage = function(e) {
            let data = JSON.parse(e.data)
            console.log(data)
            var html_string = '';
            
            var count_rows = data['count'];
            var name_file = data['file'];
            var id_file = data['id'];
            var total_count = data['total'];
            var mssge = data['mssg'];


            $(`#${id_file}`).empty();
            html_string = `
                <td>${name_file}</td>
                <td>${count_rows}/${total_count}</td>`
            if(data.status == "Failed"){
                console.log("failed");
                html_string += `<td> <i class="fa-solid fa-circle-xmark imcomplete"></i></td>`
                $.notify(mssge , "info");

            }
            if(data.status == "complete"){
                html_string += `<td> <i class="fa-solid fa-circle-check complete"></i></td>`
            }
            if(data.status == "in process"){
                html_string += `<td> <i class="fas fa-sync fa-spin process"></i></td>`
            }
            $(html_string).appendTo(`#${id_file}`);




        }
    
        notification_ws.onclose = function() {
            // setServerOffline()
            // Try to reconnect in 1 second
            setTimeout(function() {
                startWS(websocketServerLocation)
            }, 1000)
            console.log("WebSocket is Closed")

        }
    }


    //Get a CSRF cookie for request
    getCookie = function(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    //find if method is csrf safe
    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    //add csrf token to appropriate ajax requests
    $(function() {
        $.ajaxSetup({
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
                }
            }
        });
    }); //document ready

    upload_data = function(type_upload){
        let formData = new FormData();
        let userFile;
        let files_list = [];

        if(type_upload == 'stations'){
            userFile = document.getElementById("stations_csv_upload").files[0];
            formData.append('csv_file', userFile);
            files_list.push(userFile['name'])

        }
        if(type_upload == 'stngroups'){
            userFile = document.getElementById("groupStations_csv_upload").files[0];
            formData.append('csv_file', userFile);
            files_list.push(userFile['name'])


        }
        if(type_upload == 'variablestationtype'){
            userFile = document.getElementById("variableStationTypes_csv_upload").files[0];
            formData.append('csv_file', userFile);
            files_list.push(userFile['name'])


        }
        if(type_upload == 'timeSeries'){
            $.each($("#timeseries_csv_upload")[0].files, function(i, file) {
                console.log(file);
                formData.append("csv_file", file);
                files_list.push(file['name'])

            });
            console.log(userFile);
        }
    

        formData.append('type_upload',type_upload);
        formData.append('type','upload__data');
        for(var pair of formData.entries()) {
            console.log(pair[0]+', '+pair[1]);
        }

        $.ajax({
            url: `upload-files/`,
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            dataType: 'json',
    
            // handle a successful response
            success: function (resp) {
                // $.notify( "Data is being loaded into database", "success");
                // startWS(ws_url);

                console.log(resp);
                var data_list = resp['data']
                // $('#map').css('margin-bottom', '300px');
                // map.invalidateSize();
                // $("#comodin__div").show();
                // $('#sidebar').css('z-index', '2');
                var html_string = '';
                var id_lists = []
                data_list.forEach(function(item_){
                    var count_rows = item_['count'];
                    var name_file = item_['file'];
                    var id_html = item_['id'];
                    id_lists.push(id_html);
                    html_string += `<tr id=${id_html}>
                        <td>${name_file}</td>
                        <td>0/${count_rows}</td>
                        <td> <i class="fas fa-sync fa-spin process"></i></i></td>
                    </tr>`
                })
                // if(type_upload == 'stations'){
                //     $(html_string).appendTo(`#${type_upload}_table_content`);
                // }
                
                // if(type_upload == 'stngroups'){
                //     $(html_string).appendTo(`#${type_upload}_table_content`);
                // }
                $(html_string).appendTo(`#${type_upload}_table_content`);
                
                notification_ws.send(
                    JSON.stringify({
                        'type':'upload__data',
                        'type_upload': type_upload,
                        'csv_file':files_list,
                        'id':id_lists
                    })
                )

        
            },
    
            // handle a non-successful response
            error: function (xhr, errmsg, err) {
                $.notify( `${xhr.responseText}`, "error");

                // $('#raw_data_results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg + ".</div>"); // add the error to the dom
               console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
            }
        });
    }

    /************************************************************************
     *                        DEFINE PUBLIC INTERFACE
     *************************************************************************/


    public_interface = {

    };

    /************************************************************************
     *                  INITIALIZATION / CONSTRUCTOR
     *************************************************************************/

    // Initialization: jQuery function that gets called when
    // the DOM tree finishes loading

    $(function() {
        
        window.addEventListener("beforeunload", function (event) {
            $('.loader').removeClass("hidden");
         });
        
      
        let protocol = "ws"
        if (location.protocol === "https:") {
            protocol = "wss"
        }
        let ws_url = `${protocol}://${window.location.host}`
        let app_path = mchHomeUrl.replace("/apps", "")
        console.log(mchHomeUrl);
        ws_url = `${ws_url}${app_path}upload-data/notifications/ws/`
        startWS(ws_url);

        $('#show_instructions').change(function(){

            if(this.checked) {
                $("#map").hide();
                $("#instructions").show();
                $("#next_plot").hide();
                $("#last_plot").hide();
                $("#comodin__div").hide(); 
            }
            else{
                // if(isGraphsShowing){
                //     $("#map").hide();
                //     $("#next_plot").show();
                //     $("#last_plot").show();
                //     $("#comodin__div").show();
                // }
                // if(isMapShowing){
                //     $("#map").show();
                //     map.invalidateSize();
                //     $("#next_plot").hide();
                //     $("#last_plot").hide();
                //     $("#comodin__div").hide();
                // }
                $("#instructions").hide();

            }
        })


        // $('#addStations').click(function() {
        //     console.log("ASFGASFAS");
        //     $("#stations_modal").modal('show');
        // })

        // $('#addGroupsStations').click(function() {
        //     console.log("ASFGASFAS");
        //     $("#stngroups_modal").modal('show');
        // })

        // $('#addVariablesStation').click(function() {
        //     $("#variableTypesStations_modal").modal('show');
        // })
        // $('#addTs').click(function() {
        //     console.log("jkoalsf");
        //     $("#ts_modal").modal('show');
        // })

        // $('#stations_csv_button').click(function() {
        //     console.log("ASASG");
        //     var files = document.getElementById("stations_csv").files;
        //     if(Array.from(files).length < 1 ){
        //         $.notify( "Please, submit a file to upload", "warn");
        //     }
        //     else{
        //         upload_data("stations");
        //     }
        // })

        // $('#stngroups_csv_button').click(function() {
        //     var files = document.getElementById("stngroups_csv").files;
        //     if(Array.from(files).length < 1 ){
        //         $.notify( "Please, submit a file to upload", "warn");
        //     }
        //     else{
        //         upload_data("stngroups");
        //     }
        // })
        // $('#variabletypestn_csv_button').click(function() {
        //     var files = document.getElementById("variabletypestn_csv").files;
        //     if(Array.from(files).length < 1 ){
        //         $.notify( "Please, submit a file to upload", "warn");
        //     }
        //     else{
        //         upload_data("variablestationtype");
        //     }
        // })

        // $('#ts_csv_button').click(function() {
        //     var files = document.getElementById("ts_csv").files;
        //     if(Array.from(files).length < 1 ){
        //         $.notify( "Please, submit a file to upload", "warn");
        //     }
        //     else{
        //         upload_data("timeSeries");
        //     }
        // })
        
    //    $("#stations_csv_button_preview").click(function() {
    //         var files = document.getElementById("stations_csv").files;
    //         if(Array.from(files).length < 1 ){
    //             $.notify( "Please, submit a file to preview", "warn");
    //         }
    //         else{
    //             preview_stations();
    //         }
    //     })

        
        // $("#stations_csv").change(function (evt) {
        //     evt.preventDefault();
        //     validate_stations();
        // });

        // $("#stngroups_csv_button_preview").click(function() {
        //     var files = document.getElementById("stngroups_csv").files;
        //     if(Array.from(files).length < 1 ){
        //         $.notify( "Please, submit a file to preview", "warn");
        //     }
        //     else{
        //         preview_stnGroups();

        //     }
        // })
        // $("#variabletypestn_csv_button_preview").click(function() {
        //     var files = document.getElementById("variabletypestn_csv").files;
        //     if(Array.from(files).length < 1 ){
        //         $.notify( "Please, submit a file to preview", "warn");
        //     }
        //     else{
        //         preview_variabletypestn();
        //     }
        // })

        // $("#ts_csv_button_preview").click(function() {
        //     var files = document.getElementById("ts_csv").files;
        //     if(Array.from(files).length < 1 ){
        //         $.notify( "Please, submit a file to preview", "warn");
        //     }
        //     else{
        //         preview_time_series();
        //     }
        // })

        ////////
        $('#stations_csv_upload_button').click(function() {
            var files = document.getElementById("stations_csv_upload").files;
            console.log(files);
            if(Array.from(files).length < 1 ){
                $.notify( "Please, submit a file to upload", "warn");
            }
            else{
                upload_data("stations");
            }
        });
        $('#groupStations_csv_upload_button').click(function() {
            var files = document.getElementById("groupStations_csv_upload").files;
            console.log(files);
            if(Array.from(files).length < 1 ){
                $.notify( "Please, submit a file to upload", "warn");
            }
            else{
                upload_data("stngroups");
            }
        });
        $('#variableStationTypes_csv_upload_button').click(function() {
            var files = document.getElementById("variableStationTypes_csv_upload").files;
            console.log(files);
            if(Array.from(files).length < 1 ){
                $.notify( "Please, submit a file to upload", "warn");
            }
            else{
                upload_data("variablestationtype");
            }
        })
        $('#timeseries_csv_upload_button').click(function() {
            var files = document.getElementById("timeseries_csv_upload").files;
            console.log(files);
            if(Array.from(files).length < 1 ){
                $.notify( "Please, submit a file to upload", "warn");
            }
            else{
                upload_data("timeSeries");
            }
        })
        

    });




    return public_interface;


}());// End of package wrapper