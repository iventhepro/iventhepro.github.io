//speichern des aktuellen Datums
var currentDate = new Date();
//Ausführen wen Seite zum bearbeiten bereit ist
$(document).ready(function () {

    //Htmlelemnte ausblenden
    $("#klSel").css("visibility", "hidden");
    $("#pagi").css("visibility", "hidden");
    $("#table").css("visibility", "hidden");

    //Alle Berufe von der Api mit Json laden
    $.getJSON("https://sandbox.gibm.ch/berufe.php")
        .done(
            function (data, textStatus, jqXHR) {
                //notification zurücksetzten
                $('#notification').html('');
                //überprüfe ob api keine Daten geliefert hat
                if ($.isEmptyObject(data)) {
                    //verstecken von select 
                    $('#Bgr').css("visibility", "hidden");
                    //meldung ausgeben
                    $('#notification').html("<div class='alert alert-primary' role='alert'>Zur Zeit können keine Berufe gefunden werden</div>")

                } else {
                    //loop über Daten
                    $.each(data, function (key, beruf) {
                        //Daten als Option dem Select hinzufügen
                        $('#Bgr').append("<option value=" + beruf.beruf_id + " id=" + beruf.beruf_id + ">" + beruf.beruf_name + "</option>");
                    });
                    //überprüfen ob ein Beruf ausgesucht wurde 
                    if (localStorage.getItem("BID")) {
                        //Select value setzten 
                        $("#Bgr").val(localStorage.getItem("BID"));
                        //klassen laden aufgründ des Berufs
                        setKlassenOptions(localStorage.getItem("BID"));

                    }
                }
            }).fail(function () {
                //Fehlermeldung ausgeben
                $('#notification').html("<div class='alert alert-danger' role='alert'>Bei der Abfrage ist etwas schiefgelaufen :( </div>")


            });

    //Auf change hören
    $('#Bgr').bind("change", function (e) {
        //localstorge anpassen
        localStorage.setItem("BID", $('#Bgr').val());
        localStorage.removeItem("KID");
        $("tr:not(#tHead)").remove();
        $("#pagi").css("visibility", "hidden");
        $("#table").css("visibility", "hidden");

        //klassen neu setzten
        setKlassenOptions($('#Bgr').val())
    });


    //Auf change hören
    $('#KAu').bind("change", function (e) {
        //localstorage anpasse
        localStorage.setItem("KID", $('#KAu').val());
        //vorhander Stundenplan löschen
        $("tr:not(#tHead)").remove();
        //neuer Stundenplan setzten
        setTimeTable($('#KAu').val());
    });

    //Function um Klassen zu setzten
    function setKlassenOptions(id) {
        //Alle klassen entfernen
        $("#KAu option:not(.first)").remove();
        $("#KAu").val("0")
        //klassen anhand von id laden
        $.getJSON("https://sandbox.gibm.ch/klassen.php?beruf_id=" + id)
            .done(
                function (data, textStatus, jqXHR) {
                    //notification zurücksetzten
                    $('#notification').html('');
                    //überprüfe ob api keine Daten geliefert hat
                    if ($.isEmptyObject(data)) {
                        //meldung ausgeben
                        $('#notification').html("<div class='alert alert-primary' role='alert'>Zur Zeit können keine Klassen gefunden werden</div>")

                    } else {
                        //loop über Daten
                        $.each(data, function (key, klasse) {
                            //Daten als Option dem Select hinzufügen
                            $('#KAu').append("<option value=" + klasse.klasse_id + " id=" + klasse.klasse_id + ">" + klasse.klasse_longname + "</option>");
                        });
                        //überprüfen ob klasse ausgewählt wurde 
                        if (localStorage.getItem("KID")) {
                            //Klassen anhand von ID aus localstorage setzten
                            $("#KAu").val(localStorage.getItem("KID"));
                            //stundenplan neu setzen
                            setTimeTable(localStorage.getItem("KID"));
                        }
                        //select sichtbar machen//Klassen anhand von ID aus localstorage laden
                        $("#klSel").css("visibility", "visible");
                    }

                }).fail(function () {
                    //Fehlermeldung ausgeben
                    $('#notification').html("<div class='alert alert-danger' role='alert'>Bei der Abfrage ist etwas schiefgelaufen :( </div>")

                });
    }
    //Funktion für setzten der Tabelle
    function setTimeTable(id) {
        //entferne alle Tablerows 
        $("tr:not(#tHead)").remove();
        //berechne datum für pagination
        $('a:eq(1)').text(moment(currentDate).format('WW-YYYY'));
        //hole daten aus api mit klasse id und woche
        $.getJSON("https://sandbox.gibm.ch/tafel.php?klasse_id=" + id + "&woche=" + moment(currentDate).format('ww-yyyy'))
            .done(
                function (data, textStatus, jqXHR) {
                    //notification zurücksetzten
                    $('#notification').html('');
                    //überprüfe ob api keine Daten geliefert hat
                    if ($.isEmptyObject(data)) {
                        //meldung ausgeben
                        $('#notification').html("<div class='alert alert-primary' role='alert'>Zur Zeit können keine Daten gefunden werden</div>")
                        //verstecken von table
                        $("#timetable").css("visibility", "hidden");
                    } else {
                        //loop über Daten
                        $.each(data, function (key, TT) {
                            //Daten als tb dem table anfügen
                            $('#timetable tbody').append("<tr><td>" + moment(TT.tafel_datum).format('DD.MM.YYYY') + "</td><td>" + getWochentag(TT.tafel_wochentag) + "</td><td>" + TT.tafel_von + "</td><td>" + TT.tafel_bis + "</td><td>" + TT.tafel_lehrer + "</td><td>" + TT.tafel_longfach + "</td><td>" + TT.tafel_raum + "</td></tr>");
                        });
                        //Html elemnte einblenden 
                        $("#pagi").css("visibility", "visible");
                        $("#timetable").css("visibility", "visible");
                    }
                }).fail(function () {
                    //Fehlermeldung ausgeben
                    $('#notification').html("<div class='alert alert-danger' role='alert'>Bei der Abfrage ist etwas schiefgelaufen :( </div>")

                });
    }
    //funktion für berechnung für den wochentag anhand von einer Zahl
    function getWochentag(index) {
        //array mit allen wochentagen
        let wochentage = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
        //gib den wochentag anhand des indexes zurück
        return wochentage[index];
    }
    //setze des datum für die pagination
    $("a:eq(1)").text(moment(currentDate).format('WW-YYYY'));
    //auf click hören für vorherige woche
    $('li.page-item:first').on('click', function () {
        //stundenplan neu setzten
        currentDate = moment(currentDate).subtract(1, 'weeks');
        //stundenplan neu setzten
        setTimeTable(localStorage.getItem("KID"));

    });
    //auf click hören für nächste woche
    $('li.page-item:last').on('click', function () {
        //stundenplan neu setzten
        currentDate = moment(currentDate).add(1, 'weeks');
        //stundenplan neu setzten
        setTimeTable(localStorage.getItem("KID"));
    });

});