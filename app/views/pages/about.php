<?php ob_start();?>

<main>
<div id="about-page" class="max-width-container2">

    <dev id="about-head">
        <img src="/public/assets/img/Artboard.png" alt="" width="169px">
        <div class="pad1xy">
            <span class="heading1">Hi! I'm Mohamed Ilies, a network engineer & a full stack web developer</span>
            <p>I am a freshly graduated network engineer <span class="note-text">(I hope that I'm having a greater title by the time you're reading this &#129299;)</span> and while waiting for my diplomat I decided to make this project.</p>
        </div>
    </dev>
    <div id="about-cors" class="pad1xy">
        <p>When I started coding the initial idea, I didn't plan on turning it to a project. I just wanted to fill my time with productivity by testing my <span class="colored-text0">JS</span> skills on doing some <span class="colored-text0">IPv4 calculations</span>, then I decided to give the project some style with <span class="colored-text0">CSS</span> to present it in my portfolio, then I decided to deploy my static site on Heroku. Fortunately, it required adding a <span class="colored-text0">backend language</span>. Since I had to use a backend language, I decided to use a framework and add the typical home, about and contact pages and it is what it is now.</p>
        <p>I earned my <span class="colored-text0">web dev skills</span> while working on my <span class="colored-text0">graduation project</span> which was a <span class="colored-text1">home automation I O T platform</span>. I learned & used during that period <span class="colored-text0">HTML, CSS, JS, PHP, NodeJS, Arduino and Docker</span>. It was an amazing experience for me and this app is a perfect demonstration for my mastery of frontend web dev. I also know a little about manipulating graphic design tools <span class="note-text">(I made this app from scratch except a couple of assets)</span>.</p>
        <span class="heading1 centered-txt">"I pray to get a career in network engineering or cyber security and I also love web development."</span>
    </div>
</div>

</main>

<?php $content = ob_get_clean();?>
<?php require_once PROJECT_ROOT . '/app/views/inc/layout.php';?>
