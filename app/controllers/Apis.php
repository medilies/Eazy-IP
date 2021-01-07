<?php

class Apis extends Controller
{
    public function __construct()
    {
        $this->ApiModel = $this->model('Api');
    }

    public function contact()
    {

        $_POST = filter_input_array(INPUT_POST, FILTER_SANITIZE_STRING);

        // vector needed if there is optional (empty value) inputs (like phone & sub-button)
        $required = ['email', 'msg'];

        foreach ($_POST as $key => $value) {
            if (empty(trim($value)) && in_array($key, $required)) {
                $data['sub_missing'][] = $key;
            } else {
                $data[$key] = $value;
            }
        }

        //Validate data
        if (!isset($data['sub_missing'])) {

            //data formating
            if (isset($data['name'])) {
                $data['name'] = ucwords(strtolower(trim($data['name'])));
            } else {
                $data['name'] = '';
            }

            $data['email'] = strtolower($data['email']);

            if (
                strlen($data['name']) < 101 &&
                strlen($data['email']) < 101 &&
                strlen($data['msg']) < 1001
            ) {

                $this->ApiModel->insert_contact_msg($data['name'], $data['email'], $data['msg']);
                echo "nice msg";

            } else {
                echo 'ownonono';
            }

        }
    }

}
