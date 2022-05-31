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
    var public_interface,
        list_files,
        current_index_files=0;

    /************************************************************************
     *                    PRIVATE FUNCTION DECLARATIONS
     *************************************************************************/
    var preview_time_series,
        graph_something,
        summary_data_load,
        take_out_starts;
		// Object returned by the module



    /************************************************************************
     *                    PRIVATE FUNCTION IMPLEMENTATIONS
     *************************************************************************/
    take_out_starts = function(word){
        // array_not_allowed = ['da','dc','dd','de','dm','ds','na','nc','nd','nm','ns'];
        var regex_expresion = /^(da |dc|dd|de|dm|ds|na|nc|nd|nm|ns).*/;
        if(regex_expresion.test(word)){
            return word.substring(2);
        }

    }
     summary_data_load = function(){
        var summ_obj = JSON.parse(summary_String);
        console.log(summ_obj);
        $('#timeseries_summary__table_content').empty();

        var html_string = '';
        var table_names = summ_obj["TABLE_NAME"];
        var table_counts = summ_obj["TABLE_ROWS"];
        console.log(Object.entries(summ_obj));
        for(var i=0; i< table_names.length; ++i){
            var variable_name = take_out_starts(table_names[i]);
            html_string += '<tr>'
            html_string += `<td>${variable_name}</td>`;
            html_string += `<td>${table_names[i]}</td>`;
            html_string += `<td class="mega_num">${table_counts[i]}</td>`;
            html_string += `<td><i  class="fa-solid fa-location-dot fake__btn"></i></td>`;
           

            
            html_string += '</tr>';
        }

        $(html_string).appendTo('#timeseries_summary__table_content');
        
    }
     preview_time_series = function(){
        // $('#comodin__div__timeseries').empty();
        $("#comodin__div__timeseries").css("visibility", "hidden");
        $("#next_plot").hide();
        $("#last_plot").hide();
        var userFiles = document.getElementById("timeseries_csv_preview").files;
        list_files =  Array.from(userFiles);
        console.log(userFiles);
        var userFile = userFiles[current_index_files];
        let dates = [];
        let values = [];

 
        dfd.readCSV(userFile).then((df) => {
            console.log(df);
            let date_index = df['$columns'].indexOf('Datee');
            let val_index = df['$columns'].indexOf('Valuee');
            if(date_index < 0 && val_index < 0 ){
                $.notify( "Please, the columns containing the date and values should be called Datee and Valuee columns", "warn");

                return // please provide the correct names to the Datee and Valuee columns
            }
            else{
                dates = df['$dataIncolumnFormat'][date_index]
                values = df['$dataIncolumnFormat'][val_index]
                graph_something(dates,values,userFile.name,"Datee","Valuee","comodin__div__timeseries");

            }
            $('#content_divided_ts').removeClass("hidden");

            $("#next_plot").show();
            $("#last_plot").show();
            $("#comodin__div__timeseries").css("visibility", "visible");

        })

    }
    graph_something = function(dates,values,title_graph,x_axis,y_axis,div_id){


        var single_trace = {
            x: dates,
            y: values,
            mode: 'lines',
            line: {
                color: '#312e81',
                width: 1
              }
          };
          
          var data = [single_trace];
  
          
          var layout = {
            title: title_graph,
            autosize: true,
            xaxis: {
              autorange: true,
              range: [dates[0], dates[dates.length-1]],
              rangeselector: {buttons: [
                  {
                    count: 1,
                    label: '1m',
                    step: 'month',
                    stepmode: 'backward'
                  },
                  {
                    count: 6,
                    label: '6m',
                    step: 'month',
                    stepmode: 'backward'
                  },
                  {
                    count: 12,
                    label: '1yr',
                    step: 'month',
                    stepmode: 'backward'
                  },
                  {step: 'all'}
                ]},
              rangeslider: {range: [dates[0], dates[dates.length-1]]},
              type: 'date'
            }

          };
          
          Plotly.newPlot(div_id, data, layout);
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
        // update the layout to expand to the available size
        // when the window is resized
        window.onresize = function() {
            Plotly.relayout('comodin__div__timeseries', {
                'xaxis.autorange': true,
                'yaxis.autorange': true
            });
        };
        summary_data_load();
        $('#previewtimeSeries').click(function() {
            $("#timeseries_preview_modal").modal('show');
        });

        $('#uploadtimeSeries').click(function() {
            $("#timeseries_upload_modal").modal('show');
        });

        $("#timeseries_csv_preview_button_preview").click(function() {
            
            var files = document.getElementById("timeseries_csv_preview").files;
            if(Array.from(files).length < 1 ){
                $.notify( "Please, submit a file to preview", "warn");
            }
            else{
                preview_time_series();
                $("#next_plot").show();
                $("#last_plot").show();
            }
        });
        $("#last_plot").click(function(){

            current_index_files = current_index_files - 1;
            if(current_index_files < 0){
                current_index_files = 0;
                return

            }
            preview_time_series();
        });
        $("#next_plot").click(function(){

            current_index_files = current_index_files + 1;
            if(current_index_files > (list_files.length -1) ){
                current_index_files = list_files.length -1;
                return 

            }
            preview_time_series();

        });

    });




    return public_interface;


}());// End of package wrapper