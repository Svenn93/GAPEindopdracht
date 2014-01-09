<?php

function trace($data)
{
    echo '<pre>';
    print_r($data);
    echo '</pre>';
}

function globalErrorHandler($errno,$errstr,$errfile,$errline,$errcontext)
{
    if(Config::PRODUCTION)
    {
        // gebruiksvriendelijke info
        ob_start();
        trace(array(
           'errno' => $errno,
            'errstr' => $errstr,
            'errfile' => $errfile,
            'errline' => $errline,
            'errcontext' => $errcontext
        ));
        $content = ob_get_clean();
        error_log($content);
        require('error.html');
        die();
    }
    else
    {
        // enkel technische melding
        trace(array(
            'errno' => $errno,
            'errstr' => $errstr,
            'errfile' => $errfile,
            'errline' => $errline,
            'errcontext' => $errcontext
        ));
        die();
    }
}

function globalExceptionHandler($e)
{
    if(Config::PRODUCTION)
    {
        ob_start();
        trace($e);
        $content = ob_get_clean();
        error_log($content);
        require('error.html');
        die();
    }
    else
    {
        trace($e);
    }
}