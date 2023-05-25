var currentDate = new Date();
$(document).ready(function () {

    //Unnötige Htmlelemnte ausblenden
    $("#klSel").css("visibility", "hidden");
    $("#pagi").css("visibility", "hidden");
    $("#table").css("visibility", "hidden");

    //Alle Berufe von der Api mit Json laden
    $.getJSON("https://sandbox.gibm.ch/berufe.php")
        .done(
            function (data, textStatus, jqXHR) {
                $('#notification').html(''); 
                if ($.isEmptyObject(data)) {

                    $('#Bgr').css("visibility", "hidden");

                    $('#notification').html("<div class='alert alert-primary' role='alert'>Zur Zeit können keine Berufe gefunden werden</div>")

                } else {
                    $.each(data, function (key, beruf) {
                        $('#Bgr').append("<option value=" + beruf.beruf_id + " id=" + beruf.beruf_id + ">" + beruf.beruf_name + "</option>");
                    });

                    if (localStorage.getItem("BID")) {

                        $("#Bgr").val(localStorage.getItem("BID"));
                        setKlassenOptions(localStorage.getItem("BID"));

                    }
                }
            }).fail(function () {
                $('#notification').html("<div class='alert alert-danger' role='alert'>Bei der Abfrage ist etwas schiefgelaufen :( </div>")


            });

    $('#Bgr').bind("change", function (e) {
        localStorage.setItem("BID", $('#Bgr').val());
        localStorage.removeItem("KID");
        setKlassenOptions($('#Bgr').val())
    });


    $('#KAu').bind("change", function (e) {
        localStorage.setItem("KID", $('#KAu').val());
        $("tr:not(#tHead)").remove();
        setTimeTable($('#KAu').val());
    });

    function setKlassenOptions(id) {
        $("#KAu option:not(.first)").remove();
        $("#KAu").val("0")

        $.getJSON("https://sandbox.gibm.ch/klassen.php?beruf_id=" + id)
            .done(
                function (data, textStatus, jqXHR) {
                    $('#notification').html(''); 
                    if ($.isEmptyObject(data)) {
                        $('#notification').html("<div class='alert alert-primary' role='alert'>Zur Zeit können keine Klassen gefunden werden</div>")

                    } else {
                        $.each(data, function (key, klasse) {
                            $('#KAu').append("<option value=" + klasse.klasse_id + " id=" + klasse.klasse_id + ">" + klasse.klasse_longname + "</option>");
                        });

                        if (localStorage.getItem("KID")) {

                            $("#KAu").val(localStorage.getItem("KID"));
                            setTimeTable(localStorage.getItem("KID"));
                        }
                        $("#klSel").css("visibility", "visible");
                    }

                }).fail(function () {
                    $('#notification').html("<div class='alert alert-danger' role='alert'>Bei der Abfrage ist etwas schiefgelaufen :( </div>")

                });
    }


    function setTimeTable(id) {
        $("tr:not(#tHead)").remove();

        $('a:eq(1)').text(moment(currentDate).format('WW-YYYY'));

        $.getJSON("https://sandbox.gibm.ch/tafel.php?klasse_id=" + id + "&woche=" + moment(currentDate).format('ww-yyyy'))
            .done(
                function (data, textStatus, jqXHR) {
                    $('#notification').html(''); 
                    if ($.isEmptyObject(data)) {

                        $('#notification').html("<div class='alert alert-primary' role='alert'>Zur Zeit können keine Daten gefunden werden</div>")
                        $("#table").css("visibility", "hidden");
                    } else {

                        $.each(data, function (key, TT) {

                            $('#timetable tbody').append("<tr><td>" + moment(currentDate).format('DD.MM.YYYY') + "</td><td>" + getWochentag(TT.tafel_wochentag) + "</td><td>" + TT.tafel_von + "</td><td>" + TT.tafel_bis + "</td><td>" + TT.tafel_lehrer + "</td><td>" + TT.tafel_longfach + "</td><td>" + TT.tafel_raum + "</td></tr>");
                        });

                        $("#pagi").css("visibility", "visible");
                        $("#table").css("visibility", "visible");
                    }
                }).fail(function () {
                    $('#notification').html("<div class='alert alert-danger' role='alert'>Bei der Abfrage ist etwas schiefgelaufen :( </div>")

                });
    }

    function getWochentag(index) {
        let wochentage = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
        return wochentage[index];
    }

    $("a:eq(1)").text(moment(currentDate).format('WW-YYYY'));

    $('li.page-item:first').on('click', function () {
        currentDate = moment(currentDate).subtract(1, 'weeks');

        setTimeTable(localStorage.getItem("KID"));

    });
    $('li.page-item:last').on('click', function () {
        currentDate = moment(currentDate).add(1, 'weeks');
        setTimeTable(localStorage.getItem("KID"));
    });

});