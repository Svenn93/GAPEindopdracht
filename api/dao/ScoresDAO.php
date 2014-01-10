<?php

require_once WWW_ROOT . 'classes' . DS . 'DatabasePDO.php';

class ScoresDAO
{
    public $pdo;

    public function __construct()
    {
        $this->pdo = DatabasePDO::getInstance();
    }

    public function getScores()
    {
        $sql = 'SELECT userid, SUM(score) AS totaal FROM scores GROUP BY userid ORDER BY totaal ASC';
        $stmt = $this->pdo->prepare($sql);
        if($stmt->execute())
        {
            $scores = $stmt->fetchAll(PDO::FETCH_ASSOC);
            if(!empty($scores)){
                return $scores;
            }
        }
        return array();
    }

    public function getScoresByUserId($userid)
    {
        $sql = 'SELECT * FROM scores WHERE userid=:userid ORDER BY level ASC';
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindValue(":userid",$userid);
        if($stmt->execute())
        {
            $scores = $stmt->fetchAll(PDO::FETCH_ASSOC);
            if(!empty($scores)){
                return $scores;
            }
        }
        return array();
    }

    public function insertScore($userid,$level,$score)
    {
        $sql = "INSERT INTO scores(userid,level,score) VALUES(:userid,:level,:score)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindValue(":userid",$userid);
        $stmt->bindValue(":level",$level);
        $stmt->bindValue(":score",$score);
        if($stmt->execute()){
            return $this->getScoresByUserId($this->pdo->lastInsertId());
        }
        return false;
    }

    public function updateScore($userid,$level,$score)
    {
        $sql = "UPDATE scores SET score = :score WHERE userid = :userid AND level = :level";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindValue(":userid",$userid);
        $stmt->bindValue(":level",$level);
        $stmt->bindValue(":score",$score);
        if($stmt->execute()){
            return $this->getScoresByUserId($this->pdo->lastInsertId());
        }
        return false;
    }

}