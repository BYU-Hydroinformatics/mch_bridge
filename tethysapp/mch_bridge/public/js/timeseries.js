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
        graph_something;
		// Object returned by the module



    /************************************************************************
     *                    PRIVATE FUNCTION IMPLEMENTATIONS
     *************************************************************************/
     preview_time_series = function(){
        $('#comodin__div__timeseries').empty();

        var userFiles = document.getElementById("timeseries_csv_preview").files;
        list_files =  Array.from(userFiles);
        console.log(userFiles);
        var userFile = userFiles[current_index_files];
        let dates = [];
        let values = [];

        let html_string = ''
        html_string += '</tr></thead><tbody>'
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

        })
    }
    graph_something = function(dates,values,title_graph,x_axis,y_axis,div_id){


        var single_trace = {
            x: dates,
            y: values,
            mode: 'lines',
            name: 'Lines'
          };
          
          var data = [single_trace];
  
          
          var layout = {
            title: title_graph,
            xaxis: {
              title: x_axis
            },
            yaxis: {
              title: y_axis
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
            }
            preview_time_series();
        });
        $("#next_plot").click(function(){
            current_index_files = current_index_files + 1;
            if(current_index_files > (list_files.length -1) ){
                current_index_files = list_files.length -1;
            }
            preview_time_series();
        });

    });




    return public_interface;


}());// End of package wrapper