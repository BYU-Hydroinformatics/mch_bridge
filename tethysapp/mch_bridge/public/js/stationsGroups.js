/*****************************************************************************
 * FILE: mch_bridge Map JS
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
    var preview_stnGroups,
        summary_data_load;
		// Object returned by the module



    /************************************************************************
     *                    PRIVATE FUNCTION IMPLEMENTATIONS
     *************************************************************************/


 

    preview_stnGroups = function(){
        $('#show_instructions').prop('checked', false);    

        $('#comodin__div').empty();
        var html_title = `<p class="p__font__h1 my_flex">Group Stations Preview<i id="go_back_stn_gr"class="fa-solid fa-chevron-right fake__btn"></i></p>`;

        $(html_title).appendTo('#comodin__div');
        var userFile = document.getElementById("groupStations_csv_preview").files[0];
        let html_string = '<table id="csv_table" class="table table-striped"> </table>'
        // $('#comodin__div').html(html_string);
        $(html_string).appendTo('#comodin__div');

        html_string += '</tr></thead><tbody>'
        dfd.readCSV(userFile).then((df) => {

            // create table dinamycally
            html_string = `<thead><tr>`
            df['$columns'].forEach(function (item, index) {
                if(item != undefined ){
                    html_string +=`<th>${item}</th>`

                }
            });
            df['$data'].forEach(function (item, index) {

                    html_string += '<tr>'
                    item.forEach(function(value2){
                        console.log(value2,typeof(value2));
                        if(value2 != null){
                            html_string += `<td>${value2}</td>`;
                        }
                    })
                    html_string += '</tr>';
              });
            html_string += '</tbody>'
            console.log(html_string);
            // $(html_string).appendTo('#csv_table')
            $('#csv_table').html(html_string);
            $('#comodin__div').removeClass("hidden");

            $('#go_back_stn_gr').click(function(){
    
                $('#comodin__div').addClass("fadeout");

                setTimeout(function(){
                    $('#go_up_stn_gr').removeClass("hidden");
                    $('#comodin__div').addClass("hidden");
                },300);
            });
            $('#go_up_stn_gr').click(function(){
                $('#comodin__div').removeClass("fadeout");

                $('#go_up_stn_gr').addClass("hidden");

                setTimeout(function(){

                    $('#comodin__div').removeClass("hidden");
                },300);
            });

        })
    }
    summary_data_load = function(){
        var summ_obj = JSON.parse(summary_String);
        console.log(summ_obj);
        $('#stngroups_summary__table_content').empty();

        var html_string = '';
        for (const [key, value] of Object.entries(summ_obj)) {
            html_string += '<tr>'
            html_string += `<td>${key}</td>`;
            html_string += `<td class="mega_num">${value}</td>`;
            html_string += '</tr>';
        }
        $(html_string).appendTo('#stngroups_summary__table_content');
        
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
        summary_data_load()
        console.log(summary_String);
        $('#previewGroupStation').click(function() {
            $("#groupStations_preview_modal").modal('show');
        });

        $('#uploadGroupstations').click(function() {
            $("#groupStations_upload_modal").modal('show');
        });

        $("#groupStations_csv_preview_button_preview").click(function() {
            
            var files = document.getElementById("groupStations_csv_preview").files;
            if(Array.from(files).length < 1 ){
                $.notify( "Please, submit a file to preview", "warn");
            }
            else{
                preview_stnGroups();
            }
        })

    });




    return public_interface;


}());// End of package wrapper