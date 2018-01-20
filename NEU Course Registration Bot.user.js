// ==UserScript==
// @name         NEU Course Registration Bot
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  This bot scans for courses in Northeastern University with no waitlist continiously. Once it finds a seat in the course
//               it will try to register in it automatically.
// @author       Shabbir Hussain
//
// @match        https://my.northeastern.edu/group/student/services-links
// @match        https://my.northeastern.edu/group/student
// @match        https://wl11gp.neu.edu/udcprod8/twbkwbis.P_GenMenu?name=bmenu.P_RegMnu*
// @match        https://wl11gp.neu.edu/udcprod8/bwskfreg.P_AltPin
// @match        https://my.northeastern.edu/404-error
//
// @match        https://neuidmsso.neu.edu/cas-server/login?*
// @match        http://myneu.neu.edu/jsp/misc/serverFailure.jsp*
//
// @match        https://wl11gp.neu.edu/udcprod8/bwckctlg.p_disp_listcrse?term_in=*
//
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

var Config = {
    USERNAME : "",    // Enter NEU UserName here
    PASSWORD : "",    // Enter NEU password here
    CRN : 1,                      // Enter the CRN to register for
    SEM : "Spring 2018 Semester", // Enter the exact semester name to register (You can find it after clicking on add/drop courses select semester page)
    // Enter the course listing URL. It will scan the first course on that page.
    COURSE_LIST_URL: "https://wl11gp.neu.edu/udcprod8/bwckctlg.p_disp_listcrse?term_in=201830&subj_in=CS&crse_in=7290&schd_in=LEC",

    // Advanced configuration
    AUTO_LOGIN_DELAY : 1000 * 10, // milliseconds
    CHECK_DELAY: 1000 * 60  // milliseconds. Number of milliseconds to wait before checking.
};

$(document).ready(function() {
    'use strict';

    const loginOnMyNEU = function(){
        console.log("loginOnMyNEU");

        if($("#user").val() !== '') return;
        $("#user").val(Config.USERNAME);
        $("#pass").val(Config.PASSWORD);
        $("input[value='Login']").click();
    };
    const loginOnNEUID = function(){
        console.log("loginOnNEUID");

        $("#username").val(Config.USERNAME);
        $("#password").val(Config.PASSWORD);
        $("#fm1 > div.row.btn-row > input.btn-submit").click();
    };

    const checkSeats = function(){
        var elem = $('body > div.pagebodydiv > table:nth-child(5) > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(8)');
        if (parseInt(elem.html()) > 0){
            //window.alert("Seats ready");
            console.log("Seats ready");
            GM_setValue("start_registration_for_crn", true);
            goToLogin();
        } else {
            console.log("Reloading");
            setTimeout(function(){window.location.reload();}, Config.CHECK_DELAY);
        }
    };
    const goToLogin = function(){
        window.location = "https://myneu.neu.edu/c/portal/login";
    };
    const goToSelfService = function(){
        console.log("goToSelfService");
        window.location = "https://my.northeastern.edu/group/student/services-links";
    };
    const goToRegPage1 = function(){
        console.log("goToRegPage1");
        $("a:contains('Course Registration')")[1].click();
    };
    const goToRegPage2 = function(){
        console.log("goToRegPage2");
        $("a:contains('Add or Drop Classes')")[0].click();
    };
    const goToRegPage3 = function(){
        console.log("goToRegPage3");
        const title = $("body > div.pagetitlediv > table > tbody > tr:nth-child(1) > td:nth-child(1) > h2")[0].innerText;
        console.log(title);
        if(title == "Registration Term") {
            console.log("Selecting semester");
            $("select").find("option:contains('" + Config.SEM + "')").prop('selected', true);
            $("input[type='submit']").click();
        } else if(title == "Add or Drop Classes") {
            console.log("Selecting CRN");
            $("#crn_id1").val(Config.CRN);
            GM_setValue("start_registration_for_crn", false);

            setTimeout(function(){$('input[type="submit"]').click();}, 1000);
        }
    };

    const flagRegCRN = GM_getValue("start_registration_for_crn", false);

    if (window.location.href.startsWith(Config.COURSE_LIST_URL))
        setTimeout(checkSeats, Config.AUTO_LOGIN_DELAY);
    else if (flagRegCRN && window.location.href.startsWith("https://my.northeastern.edu/group/student") && !window.location.href.startsWith("https://my.northeastern.edu/group/student/services-links"))
        setTimeout(goToSelfService, Config.AUTO_LOGIN_DELAY);
    else if (window.location.href.startsWith("https://my.northeastern.edu/404-error"))
        setTimeout(goToSelfService, Config.AUTO_LOGIN_DELAY);
    else if (flagRegCRN && window.location.href.startsWith("https://my.northeastern.edu/group/student/services-links"))
        setTimeout(goToRegPage1, Config.AUTO_LOGIN_DELAY);
    else if (flagRegCRN && window.location.href.startsWith("https://wl11gp.neu.edu/udcprod8/twbkwbis.P_GenMenu?name=bmenu.P_RegMnu"))
        setTimeout(goToRegPage2, Config.AUTO_LOGIN_DELAY);
    else if (flagRegCRN && window.location.href.startsWith("https://wl11gp.neu.edu/udcprod8/bwskfreg.P_AltPin"))
        setTimeout(goToRegPage3, Config.AUTO_LOGIN_DELAY);

    else if (window.location.href.startsWith("https://neuidmsso.neu.edu/cas-server/login?"))
        setTimeout(loginOnNEUID, Config.AUTO_LOGIN_DELAY);
    else if (window.location.href.startsWith("http://myneu.neu.edu/jsp/misc/serverFailure.jsp"))
        setTimeout(loginOnNEUID, Config.AUTO_LOGIN_DELAY);
});