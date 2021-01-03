<?php ob_start();?>

<div id="rad"></div>

<main>
    <div id="showcase" class="max-width-container">
        <div id="showcase-text">
            <h1>Focus on real engineering</h1>

            <p>Let us handle the boring calculations for you</p>

            <a class="inactive-app" href="/pages/app">Get started</a>
        </div>

        <div id="showcase-img">
            <img src="/assets/img/demo.png" alt="" width="100%" />
        </div>
    </div>

    <div id="services">
        <div class="max-width-container">
            <div>
                <div class="rounded">
                    <i class="fal fa-tachometer-alt-fastest fa-3x"></i>
                </div>
                <div>
                    <h4>Fast & Reliable</h4>
                    <p>Flawless results from a simple input</p>
                </div>
            </div>
            <div>
                <div class="rounded">
                    <i class="fal fa-money-bill-wave-alt fa-3x"></i>
                </div>
                <div>
                    <h4>Free</h4>
                    <p>Completely free</p>
                </div>
            </div>
            <div>
                <div class="rounded">
                    <i class="fal fa-wifi-slash fa-3x"></i>
                </div>
                <div>
                    <h4>Highly available</h4>
                    <p>
                        Available for all the modern browsers, including
                        offline mode
                    </p>
                </div>
            </div>
            <div>
                <div class="rounded">
                    <i class="fal fa-layer-plus fa-3x"></i>
                </div>
                <div>
                    <h4>Easy install</h4>
                    <p>
                        1 click in your browser installs the application
                        on any OS
                    </p>
                </div>
            </div>
        </div>
    </div>

    <div id="install" class="max-width-container">
        <div id="install-img">
            <img src="/assets/img/install0.png" alt="" width="100%" />
        </div>

        <div id="install-text">
            <p>
                <span class="colored-text1">Usable</span> from any modern
                browser
            </p>
            <i class="fab fa-chrome fa-2x"></i>
            <i class="fab fa-firefox fa-2x"></i>
            <i class="fab fa-opera fa-2x"></i>
            <i class="fab fa-edge fa-2x"></i>
            <i class="fab fa-safari fa-2x"></i>
            <p>
                <span class="colored-text1">Installable</span> on any
                common OS
            </p>
            <i class="fab fa-windows fa-2x"></i>
            <i class="fab fa-android fa-2x"></i>
            <i class="fab fa-linux fa-2x"></i>
            <i class="fab fa-apple fa-2x"></i>
        </div>
    </div>

    <div id="about">
        <div id="about-text">
            <p>I am a network engineer & a full stack web developer</p>
            <p>Get in touch with me job hiring or for service request</p>
        </div>
        <div id="about-btns">
            <button class="btn">More about me</button>
            <button class="btn">Contact</button>
            <button class="btn">Support the project</button>
        </div>
    </div>

</main>

<?php $content = ob_get_clean();?>
<?php require_once PROJECT_ROOT . '/app/views/inc/layout.php';?>
