<?php
/*
 *
 */
class Database
{

    protected $Selector;
    protected $Insertor;
    protected $Updator;

    protected function connexion(string $user_name, string $user_password)
    {
        $cnx = new PDO('mysql:host=' . getenv('DB_HOSTNAME') . ';dbname=' . getenv("DB_NAME"), $user_name, $user_password);

        $cnx->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $cnx->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

        return $cnx;
    }

    /**
     * Used inside Model's constructors
     * Set the empty inherited properties $Selector, $Insertor and $Updator
     * to become PDO connections with MySQL users. Using the connexion() method
     */
    protected function set_db_users(array $required_privileges): void
    {
        if (in_array('SELECT', $required_privileges)) {
            $this->Selector = $this->connexion(getenv('select_username'), getenv('select_password'));
        }
        if (in_array('INSERT', $required_privileges)) {
            $this->Insertor = $this->connexion(getenv('insert_username'), getenv('insert_password'));
        }
        if (in_array('UPDATE', $required_privileges)) {
            $this->Updator = $this->connexion(getenv('update_username'), getenv('insert_password'));
        }
    }

}
