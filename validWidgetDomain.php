<?php
    
    $validDomains = array(
                          "tojomediallc.com" => "b77a402b-99ae-482d-b857-5af4a1ac8655",
                          "parkviewmc.com" => "4431fe79-1dba-49c5-be0a-b009babc6342",
                          "portal.incendant.com" => "4431fe79-1dba-49c5-be0a-b009babc6342",
                          "incendant.com" => "b77a402b-99ae-482d-b857-5af4a1ac8655"
    );

    $domain = $_GET["domain"];
    header("Access-Control-Allow-Origin: *");
    $lid = $validDomains[trim($domain)];
    if ($lid) {
        echo $lid;
    } else {
        echo "DEFAULT";
    }
?>