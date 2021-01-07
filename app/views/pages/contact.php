<?php ob_start();?>

<main>

    <div class="pad1xy">
        <form  method="post" id="contact-form" class="pad1xy">
            <input type="text" name="name" id="name" class="block centered-block" placeholder="Your name" required>
            <input type="email" name="email" id="email" class="block centered-block" placeholder="Your Email" required>
            <textarea name="msg" id="msg" cols="50" rows="15" maxlength="1000" placeholder="Message" required></textarea>
            <button type="submit" name="contact_msg" class="btn">Send</button>
        </form>
    </div>


</main>

<?php $content = ob_get_clean();?>
<?php require_once PROJECT_ROOT . '/app/views/inc/layout.php';?>
