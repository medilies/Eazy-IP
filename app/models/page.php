<?php
// writte requests with heredoc ?
class Page extends Database
{

    public function record_visit()
    {

        try {

            if (
                !isset($_SESSION['recorded_visit']) ||
                isset($_SESSION['recorded_visit']) && $_SESSION['recorded_visit'] != true
            ) {

                $query = "INSERT INTO visitors (address) VALUES ('" . $_SERVER['REMOTE_ADDR'] . "')";

                $visit = $this->cnx->prepare($query);

                $visit->execute();

                $_SESSION['recorded_visit'] = true;
            }

        } catch (PDOException $e) {
            echo "Error!: " . $e->getMessage() . "<br/>";
        }
    }
}
