/*****************************************************************************
 * FILE: mch_bridge variableStationType JS
 * DATE: 03/16/22
 * AUTHOR: Giovanni Romero
 * COPYRIGHT:
 * LICENSE:
 *****************************************************************************/

/*****************************************************************************
 *                      LIBRARY WRAPPER
 *****************************************************************************/

var VARIABLESTATIONTYPE_OBJECT = (function () {
  // Wrap the library in a package function
  "use strict"; // And enable strict mode for this library

  /************************************************************************
   *                      MODULE LEVEL / GLOBAL VARIABLES
   *************************************************************************/
  var public_interface;
  /************************************************************************
   *                    PRIVATE FUNCTION DECLARATIONS
   *************************************************************************/
  var preview_variabletypestn, summary_data_load;
  // Object returned by the module

  /************************************************************************
   *                    PRIVATE FUNCTION IMPLEMENTATIONS
   *************************************************************************/
  summary_data_load = function () {
    var summ_obj = JSON.parse(summary_String);
    console.log(summ_obj);
    $("#variablestationtype_summary__table_content").empty();
    if (summ_obj.length > 0) {
      let warning_et = "The MCH instance do not have any variable station type";
      $.notify(warning_et, "warn");
    }
    var html_string = "";
    for (const [key, value] of Object.entries(summ_obj)) {
      html_string += "<tr>";
      html_string += `<td>${key}</td>`;
      html_string += `<td class="mega_num">${value}</td>`;
      html_string += "</tr>";
    }
    $(html_string).appendTo("#variablestationtype_summary__table_content");
  };

  preview_variabletypestn = function () {
    $("#comodin__div__variable__type").empty();
    // var html_title = `<p class="p__font__h1 my_flex"> Variable Station Type Preview <i id="go_back_var"class="fa-solid fa-chevron-right fake__btn"></i></p>`
    var html_title = `<p class="p__font__h1 my_flex">Variable Station Type Preview <span class="flex_buttons"> <span id="go_back_var_prev" class="fake__btn hide_bar_color"> <i class="fa-solid fa-xmark"></i></span> <span id="go_back_var_menu" class="fake__btn hidden button_icon">Menu <i class="fa-solid fa-chevron-right "></i></span> </span></p>`;

    // var html_title = `<p class="p__font__h1 my_flex">Variable Station Type Preview<i class="fa-solid fa-chevron-left fake__btn hide_bar2 hidden"></i></p>`;

    $(html_title).appendTo("#comodin__div__variable__type");

    var userFile = document.getElementById("variableStationTypes_csv_preview")
      .files[0];
    let html_string =
      '<table id="csv_table" class="table table-striped"> </table>';
    // $('#comodin__div__variable__type').html(html_string);
    $(html_string).appendTo("#comodin__div__variable__type");

    html_string += "</tr></thead><tbody>";
    dfd.readCSV(userFile).then((df) => {
      // create table dinamycally
      html_string = `<thead><tr>`;
      df["$columns"].forEach(function (item, index) {
        if (item != undefined) {
          html_string += `<th>${item}</th>`;
        }
      });
      df["$data"].forEach(function (item, index) {
        html_string += "<tr>";
        item.forEach(function (value2, index) {
          if (value2 != null) {
            html_string += `<td>${value2}</td>`;
          }
        });
        html_string += "</tr>";
      });
      html_string += "</tbody>";
      $("#csv_table").html(html_string);
      $("#comodin__div__variable__type").removeClass("hidden");

      $("#go_back_var_prev").click(function () {
        $("#comodin__div__variable__type").addClass("fadeout");
        //
        // setTimeout(function(){
        // $('#go_up_stn_gr').removeClass("hidden");
        $("#go_show_prev_var").removeClass("hidden");

        //not sure
        if ($("#sidebar").hasClass("side_hidden")) {
          console.log("side_bar hidden");
          // $('#go_up_var').addClass("hidden");
          // $('#go_up_var').removeClass("hidden");
          if (!$("#comodin__div__variable__type").hasClass("hidden")) {
            $("#go_up_var").removeClass("hidden");
          } else {
            $("#go_up_var").addClass("hidden");
            $("#go_back_var_menu").removeClass("hidden");
          }
        }

        $("#comodin__div__variable__type").addClass("hidden");
        // },300);
      });
      $("#go_show_prev_var").click(function () {
        $("#comodin__div__variable__type").removeClass("fadeout");

        $("#go_up_var").addClass("hidden");

        // setTimeout(function(){
        if (!$("#sidebar").hasClass("side_hidden")) {
          // $('#go_up_var').addClass("hidden");
          $("#go_back_var_menu").addClass("hidden");

          // go_back_var_menu
          // if(!$("#comodin__div__variable__type").hasClass("hidden")){
          //     $('#go_up_var').removeClass("hidden");
          // }
        } else {
          $("#go_back_var_menu").removeClass("hidden");
        }

        $("#go_show_prev_var").addClass("hidden");

        $("#comodin__div__variable__type").removeClass("hidden");
        // },300);
      });

      $("#go_back_var_menu").click(function () {
        if ($("#app-content-wrapper").hasClass("show-nav")) {
          console.log("nav bar showing menu apearing");
          $("#sidebar").removeClass("side_out");
          $("#sidebar").removeClass("side_out_double");
          $("#sidebar").addClass("side_margin");
          $("#sidebar").removeClass("side_hidden");
        }
        //nav_bar not showing
        else {
          console.log("nav bar not showing menu apearing");
          $("#sidebar").removeClass("side_out_double");
          $("#sidebar").addClass("side_margin");
          $("#sidebar").addClass("side_out");
          $("#sidebar").removeClass("side_hidden");
        }
        $("#go_back_var_menu").addClass("hidden");
        $(".vertical__div").addClass("margin_side");
      });
      // $('#go_back_var').click(function(){

      //     $('#comodin__div__variable__type').addClass("fadeout");

      //     setTimeout(function(){
      //         $('#go_up_var').removeClass("hidden");
      //         $('#comodin__div__variable__type').addClass("hidden");
      //     },300);
      // });
      // $('#go_up_var').click(function(){
      //     $('#comodin__div__variable__type').removeClass("fadeout");

      //     $('#go_up_var').addClass("hidden");

      //     setTimeout(function(){

      //         $('#comodin__div__variable__type').removeClass("hidden");
      //     },300);
      // });

      // $('.hide_bar2').click(function(){
      //     $('.vertical__div').addClass("margin_side");
      //     $(".hide_bar_div").show();

      //         if($("#comodin__div").is(":hidden")){

      //             // $('.hide_bar2').addClass("hidden");
      //             $("#go_up_stn_gr").addClass("hidden");
      //         }
      //         else{
      //             // $('.hide_bar2').addClass("hidden");

      //             $(".hide_bar2").addClass("hidden");
      //         }
      // })
    });
  };

  /************************************************************************
   *                        DEFINE PUBLIC INTERFACE
   *************************************************************************/

  public_interface = {};

  /************************************************************************
   *                  INITIALIZATION / CONSTRUCTOR
   *************************************************************************/

  // Initialization: jQuery function that gets called when
  // the DOM tree finishes loading

  $(function () {
    // $('.hide_bar').click(function(){
    //     $('.vertical__div').removeClass("margin_side");
    //     $(".hide_bar_div").hide();
    //     $('.hide_bar2').removeClass("hidden");
    //     if($("#comodin__div").is(":hidden")){
    //         $("#go_up_stn_gr").removeClass("hidden");
    //     }
    //     else{
    //         $("#go_up_stn_gr").removeClass("hide_bar2");
    //     }

    // })

    $(".hide_bar").click(function () {
      //nav bar showing
      if ($("#app-content-wrapper").hasClass("show-nav")) {
        console.log("nav bar showing not showing menu");
        $("#sidebar").addClass("side_margin");
        $("#sidebar").addClass("side_out_double");
        $("#sidebar").removeClass("side_out");
        $("#sidebar").addClass("side_hidden");
      }
      //nav_bar not showing
      else {
        console.log("nav bar not showing not showing menu");

        $("#sidebar").addClass("side_out_double");
        $("#sidebar").addClass("side_margin");
        $("#sidebar").addClass("side_out");
        $("#sidebar").addClass("side_hidden");
      }

      $(".vertical__div").removeClass("margin_side");
      // $('.hide_bar2').removeClass("hidden");

      if ($("#comodin__div__variable__type").hasClass("hidden")) {
        console.log("preview widnow is hidden");
        $("#go_up_var").removeClass("hidden");
      }
      //if preview is showing
      else {
        console.log("preview widnow is showing");
        $("#go_up_var").addClass("hidden");
        $("#go_back_var_menu").removeClass("hidden");
      }
    });

    $("#go_up_var").click(function () {
      if ($("#app-content-wrapper").hasClass("show-nav")) {
        console.log("nav bar showing menu apearing");
        $("#sidebar").removeClass("side_out");
        $("#sidebar").removeClass("side_out_double");
        $("#sidebar").addClass("side_margin");
        $("#sidebar").removeClass("side_hidden");
      }
      //nav_bar not showing
      else {
        console.log("nav bar not showing menu apearing");
        $("#sidebar").removeClass("side_out_double");
        $("#sidebar").addClass("side_margin");
        $("#sidebar").addClass("side_out");
        $("#sidebar").removeClass("side_hidden");
      }
      $("#go_up_var").addClass("hidden");
      $(".vertical__div").addClass("margin_side");
    });

    // $('.hide_bar2').click(function(){
    //     $('.vertical__div').addClass("margin_side");
    //     $(".hide_bar_div").show();

    //         if($("#comodin__div").is(":hidden")){

    //             // $('.hide_bar2').addClass("hidden");
    //             $("#go_up_stn_gr").addClass("hidden");
    //         }
    //         else{
    //             // $('.hide_bar2').addClass("hidden");

    //             $(".hide_bar2").addClass("hidden");
    //         }
    // })

    // Make tab available and active
    var tab_lists = [
      "stations_tab",
      "group_station_tab",
      "variable_stn_tab",
      "time_series_tab",
    ];
    tab_lists.forEach(function (item) {
      $(`#${item}`).removeClass("active_tab");
    });
    $(`#variable_stn_tab`).addClass("active_tab");
    summary_data_load();
    go_up_var;
    // $('#go_up_var').click(function(){
    //     $('#comodin__div__variable__type').removeClass("hidden");
    // });
    $("#previewVariableStationTypes").click(function () {
      $("#variableStationTypes_preview_modal").modal("show");
    });

    $("#uploadVariableStationTypes").click(function () {
      $("#variableStationTypes_upload_modal").modal("show");
    });

    $("#variableStationTypes_csv_preview_button_preview").click(function () {
      var files = document.getElementById(
        "variableStationTypes_csv_preview"
      ).files;
      if (Array.from(files).length < 1) {
        $.notify("Please, submit a file to preview", "warn");
      } else {
        preview_variabletypestn();
      }
    });
  });

  return public_interface;
})(); // End of package wrapper
