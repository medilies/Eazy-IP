<?php
// writte requests with heredoc ?
class Api extends Database
{

    public function insert_contact_msg($name, $email, $msg)
    {

        try {

            $query = "INSERT INTO messages(name, email, msg) VALUES (:name, :email, :msg)";

            $contact_message = $this->cnx->prepare($query);

            $contact_message->bindParam(':name', $name, PDO::PARAM_STR);
            $contact_message->bindParam(':email', $email, PDO::PARAM_STR);
            $contact_message->bindParam(':msg', $msg, PDO::PARAM_STR);

            $contact_message->execute();

        } catch (PDOException $e) {
            echo "Error!: " . $e->getMessage() . "<br/>";
        }
    }

    public function record_visit()
    {

        try {

            $query = "INSERT INTO visitors (addr) VALUES ('" . $_SERVER['REMOTE_ADDR'] . "')";

            $visit = $this->cnx->prepare($query);

            $visit->execute();

            $_SESSION['recorded_visit'] = true;

        } catch (PDOException $e) {
            echo "Error!: " . $e->getMessage() . "<br/>";
        }
    }
}
