<?php


header("Content-Type: application/json");
define('WWW_ROOT', dirname(__FILE__) . DIRECTORY_SEPARATOR);
define('DS', DIRECTORY_SEPARATOR);


require_once WWW_ROOT . 'includes' . DS . 'functions.php';
require_once WWW_ROOT . 'classes' . DS . 'Config.php';
require_once WWW_ROOT . 'dao' . DS . 'ScoresDAO.php';
require_once 'Slim' . DS . 'Slim.php';

$app = new Slim();

$app->get('/score', 'getScores');
$app->get('/score/:id', 'getScoresByUserId');
$app->post('/score','insertScore');
$app->post('/score/:id','updateScore');

$app->run();

function getScores(){
    $scoresDAO = new ScoresDAO();
    echo json_encode($scoresDAO->getScores());
}

function getScoresByUserId($id){
    $scoresDAO = new ScoresDAO();
    echo json_encode($scoresDAO->getScoresByUserId($id));
}

function insertScore(){
    $post = (array) json_decode(Slim::getInstance()->request()->getBody());
    if(empty($post)){
        $post = Slim::getInstance()->request()->put();
    }
    $scoresDAO = new ScoresDAO();
    echo json_encode(
        $scoresDAO->insertScore($post['userid'],$post['level'],$post['score'])
    );
}

function updateScore($id){
    $post = (array) json_decode(Slim::getInstance()->request()->getBody());
    if(empty($post)){
        $post = Slim::getInstance()->request()->post();
    }
    $scoresDAO = new ScoresDAO();
    echo json_encode(
        $scoresDAO->updateScore($id,$post['level'],$post['score'])
    );
}




