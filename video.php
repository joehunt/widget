<?php

function rsa_sha1_sign($policy, $private_key_filename) {
    $signature = "";

    // load the private key
    $fp = fopen($private_key_filename, "r");
    $priv_key = fread($fp, 8192);
    fclose($fp);
    $pkeyid = openssl_get_privatekey($priv_key);

    // compute signature
    openssl_sign($policy, $signature, $pkeyid);

    // free the key from memory
    openssl_free_key($pkeyid);

    return $signature;
}

function url_safe_base64_encode($value) {
    $encoded = base64_encode($value);
    // replace unsafe characters +, = and / with the safe characters -, _ and ~
    return str_replace(array('+', '=', '/'),array('-', '_', '~'),$encoded);
}

function create_stream_name($stream, $policy, $signature, $key_pair_id, $expires) {
    $result = $stream;
    // if the stream already contains query parameters, attach the new query parameters to the end
    // otherwise, add the query parameters
    $separator = strpos($stream, '?') == FALSE ? '?' : '&';
    // the presence of an expires time means we're using a canned policy
    if($expires) {
        $result .= $path . $separator . "Expires=" . $expires . "&Signature=" . $signature . "&Key-Pair-Id=" . $key_pair_id;
    } 
    // not using a canned policy, include the policy itself in the stream name
    else {
        $result .= $path . $separator . "Policy=" . $policy . "&Signature=" . $signature . "&Key-Pair-Id=" . $key_pair_id;
    }

    // new lines would break us, so remove them
    return str_replace('\n', '', $result);
}

function encode_query_params($stream_name) {
    // the adobe flash player has trouble with query parameters being passed into it, 
    // so replace the bad characters with their url-encoded forms
    return str_replace(
        array('?', '=', '&'),
        array('%3F', '%3D', '%26'),
        $stream_name);
}

function get_canned_policy_stream_name($video_path, $private_key_filename, $key_pair_id, $expires) {
    // this policy is well known by CloudFront, but you still need to sign it, since it contains your parameters
    $canned_policy = '{"Statement":[{"Resource":"' . $video_path . '","Condition":{"DateLessThan":{"AWS:EpochTime":'. $expires . '}}}]}';
    // the policy contains characters that cannot be part of a URL, so we base64 encode it
    $encoded_policy = url_safe_base64_encode($canned_policy);
    // sign the original policy, not the encoded version
    $signature = rsa_sha1_sign($canned_policy, $private_key_filename);
    // make the signature safe to be included in a url
    $encoded_signature = url_safe_base64_encode($signature);

    // combine the above into a stream name
    $stream_name = create_stream_name($video_path, null, $encoded_signature, $key_pair_id, $expires);
    // url-encode the query string characters to work around a flash player bug
    return encode_query_params($stream_name);
}

function get_custom_policy_stream_name($video_path, $private_key_filename, $key_pair_id, $policy) {
    // the policy contains characters that cannot be part of a URL, so we base64 encode it
    $encoded_policy = url_safe_base64_encode($policy);
    // sign the original policy, not the encoded version
    $signature = rsa_sha1_sign($policy, $private_key_filename);
    // make the signature safe to be included in a url
    $encoded_signature = url_safe_base64_encode($signature);

    // combine the above into a stream name
    $stream_name = create_stream_name($video_path, $encoded_policy, $encoded_signature, $key_pair_id, null);
    // url-encode the query string characters to work around a flash player bug
    //return encode_query_params($stream_name);
    return $stream_name;
}


// Path to your private key.  Be very careful that this file is not accessible
// from the web!

$private_key_filename = '/home/incend9/key/pk-APKAIWHFBZ3AZXABAGDQ.pem';
$key_pair_id = 'APKAIWHFBZ3AZXABAGDQ';


    $shortcode = htmlspecialchars($_GET["shortcode"]);
    $scheme = htmlspecialchars($_GET["scheme"]);
    $brief = htmlspecialchars($_GET["brief"]);
    $autoplay = htmlspecialchars($_GET["autoplay"]);

    $video_path = $shortcode.'/'.$shortcode.'.mp4';
    if ($brief=="true") {
        $video_path = 'short/'.$shortcode.'_C.mp4';
    }

$expires = time() + 3000; // 300 secs from now
$canned_policy_stream_name = get_canned_policy_stream_name($video_path, $private_key_filename, $key_pair_id, $expires);

$client_ip = $_SERVER['REMOTE_ADDR'];
$policy = 
'{'.
    '"Statement":['.
        '{'.
            '"Resource":"'. $video_path . '",'.
            '"Condition":{'.
                '"IpAddress":{"AWS:SourceIp":"' . $client_ip . '/32"},'.
                '"DateLessThan":{"AWS:EpochTime":' . $expires . '}'.
            '}'.
        '}'.
    ']' .
'}';
$custom_policy_stream_name = get_custom_policy_stream_name($video_path, $private_key_filename, $key_pair_id, $policy);
$custom_policy_stream_name2 = get_custom_policy_stream_name('http://d3jsy9ww2x6jf3.cloudfront.net/AD/AD.png', $private_key_filename, $key_pair_id, $policy);

?>

<html>
<head>
<title>Incendant Patient Education</title>
<meta name="description" content="Example Video: <?= $title ?>" />
<meta name="keywords" content="patient satisfaction, improve patient satisfaction, patient education, Incendant, patient portal, patient, video, education, teaching patients, discharge instructions, video discharge instructions" />
<meta http-equiv="content-type" content="text/html; charset=utf-8" />
<meta name="author" content="Incendant" />

<link rel="stylesheet" href="resources/css/<?php echo $scheme; ?>.css">
<script type="text/javascript" src="http://incendant.com/jwplayer/jwplayer.js"></script>
<script type="text/javascript">jwplayer.key="qRu5Fl/V8xAT8KDeQ2YTL+d/sUcZlaxBzGUJNiAxc40=";</script>
<link rel="shortcut icon" href="//www.incendant.com/favicon.ico" />
</head>
<body>

<div id="demovideo">Loading the player ...</div>
<script type="text/javascript">
var shortcode = '<?= $shortcode ?>';
var enSub = 'http://s3.amazonaws.com/incendant/'+shortcode+'/'+shortcode+'_en.srt';
var esSub = 'http://s3.amazonaws.com/incendant/'+shortcode+'/'+shortcode+'_es.srt';
var image_file_url = 'http://s3.amazonaws.com/incendant/<?= $shortcode ?>/<?= $shortcode ?>.png';
<?php if ($brief=="true") { ?>
var videoLink = 'http://s3.amazonaws.com/incendant/short/<?= $shortcode ?>_C.mp4';
<?php } else { ?>
var videoLink = 'http://s3.amazonaws.com/incendant/<?= $shortcode ?>/<?= $shortcode ?>.mp4';
<?php } ?>
var signedUrl = '<?= $custom_policy_stream_name ?>';
var streamer = 'rtmp://s2kgioo4qra5mp.cloudfront.net/cfx/st/';
var player = 'http://incendant.com/jwplayer/jwplayer.flash.swf';

var width = "100%";
var height = "95%";

jwplayer("demovideo").setup({
                            width: width,
                            height: height,
                            image: image_file_url,
                            autostart : <?php if ($autoplay=="true") { echo "true";} else { echo "false";} ?>,
                            primary: "flash",
                            player: player,
                            tracks: [{
                            file: enSub,
                            label: "English",
                            kind: "captions"
                            },{
                            file: esSub,
                            kind: "captions",
                            label: "Spanish"
                            }],
                            sources: [{ 
                            file: streamer+"mp4:"+signedUrl
                            },{
                            file: videoLink
                            }],
                            ga: {idstring: shortcode }
                            });

</script>
<div class="x-tabbar-light" width="100%">
<a href="http://incendant.com"><img src="themes/images/logo2transparent.png" height="5%"></img></a>
</div>
</body>
</html>