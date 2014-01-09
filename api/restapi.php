<?php


define('WWW_ROOT', dirname(__FILE__) . DIRECTORY_SEPARATOR);
define('DS', DIRECTORY_SEPARATOR);


require_once WWW_ROOT . 'includes' . DS . 'functions.php';
require_once WWW_ROOT . 'classes' . DS . 'Config.php';
require_once WWW_ROOT . 'dao' . DS . 'ScoresDAO.php';
require_once 'Slim' . DS . 'Slim.php';

$app = new Slim();

$app->get('/score/:id', 'getScoresByUserId');
$app->post('/insertScore','insertScore');
$app->post('/updateScore','updateScore');


$app->run();

function getScoresByUserId($id){
    $scoresDAO = new ScoresDAO();
    echo json_encode($scoresDAO->getScoresByUserId($id));
}

function insertScore(){
    $post = (array) json_decode(Slim::getInstance()->request()->getBody());
    if(empty($post)){
        $post = Slim::getInstance()->request()->post();
    }
    $scoresDAO = new ScoresDAO();
    echo json_encode(
        $scoresDAO->insertScore($post['userid'],$post['level'],$post['score'])
    );
}

function updateScore(){
    $post = (array) json_decode(Slim::getInstance()->request()->getBody());
    if(empty($post)){
        $post = Slim::getInstance()->request()->post();
    }
    $scoresDAO = new ScoresDAO();
    echo json_encode(
        $scoresDAO->updateScore($post['userid'],$post['level'],$post['score'])
    );
}




