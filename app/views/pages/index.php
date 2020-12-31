<?php ob_start();?>

<div class="max-width-container">

    <div id="options">
        <div id="clf-option">Classful address</div>
        <div id="cls-option">Classless address</div>
        <div id="vlsm-option" class="current-option">VLSM</div>
    </div>

    <div id="clf-addr" class="hidden">
        <form id="js-clf-addressing" class="soft-container">
            <p>Collect the network's info of the given address</p>
            <label for="clf-addr"
                >Classful
                <span class="colored-text">IPv4 address</span
                >:</label
            ><br />
            <input
                type="text"
                id="js-clf-address"
                name="clf-addr"
                placeholder="i.e. 192.168.1.2"
                required
            />
            <br />
            <button type="submit" class="btn">Get info</button>
        </form>
        <div class="soft-container">
            <span class="colored-text">Subnet</span>
            info
            <div id="js-clf-info"></div>
        </div>
    </div>

    <div id="cls-addr" class="hidden">
        <form id="js-cls-addressing" class="soft-container">
            <p>
                Collect the subnets' info of the given unicast
                address
            </p>
            <label for="cls-addr"
                >Classless
                <span class="colored-text">IPv4 address</span
                >:</label
            ><br />
            <input
                type="text"
                id="js-cls-address"
                name="cls-addr"
                placeholder="i.e. 192.168.1.34"
                required
            />
            <br />
            <label for="cls-mask-or-prefix">
                <span class="colored-text">Mask</span> or
                <span class="colored-text">Prefix</span>:</label
            ><br />
            <input
                type="text"
                id="js-cls-mask-or-prefix"
                name="cls-mask-or-prefix"
                placeholder="i.e. 255.255.255.240 || /28"
                required
            />
            <br />
            <button type="submit" class="btn">Get info</button>
        </form>
        <div class="soft-container">
            <span class="colored-text">Subnet</span>
            info
            <div id="js-cls-info"></div>
        </div>
        <div class="soft-container">
            <div id="js-cls-neighbors-info">
                (Extra)
                <span class="colored-text"
                    >Possible adjacent subnets details</span
                >
                in the /8, /16 or /24 container subnet
            </div>
        </div>
        <div class="soft-container">
            <div id="js-cls-upper-prefixes-neighbors">
                (Extra)
                <span class="colored-text"
                    >Possible adjacent subnets
                </span>
                in container subnets with a variation of prefixes
            </div>
        </div>
    </div>

    <div id="vlsm">
        <form id="js-vlsm" class="soft-container">
            <label for="js-vlsm-network"
                ><span class="colored-text">Main subnet</span>
                address in CIDR notation:</label
            ><br />
            <input
                type="text"
                id="js-vlsm-network"
                placeholder="i.e. 10.0.0.0/25"
                required
            /><br />
            <label>
                <span class="colored-text">Subnet chunks</span>
                (optional chunk name & hosts per subnet):</label
            ><br />
            <div id="js-vlsm-inputs">
                <div>
                    <input
                        type="text"
                        class="js-vlsm-names"
                        aria-label="The subnet name"
                        value="(nameless)"
                    />
                    <input
                        type="text"
                        class="js-vlsm-subnets short-input"
                        aria-label="The subnet size"
                        placeholder="5"
                        required
                    />
                </div>
                <div>
                    <input
                        type="text"
                        class="js-vlsm-names"
                        aria-label="The subnet name"
                        value="(nameless)"
                    />
                    <input
                        type="text"
                        class="js-vlsm-subnets short-input"
                        aria-label="The subnet size"
                        placeholder="13"
                        required
                    />
                    <i class="js-add-subnet fas fa-plus-circle"></i>
                </div>
                <div id="vlsm-ref-input">
                    <input
                        type="text"
                        class="js-vlsm-names"
                        aria-label="The subnet name"
                        value="(nameless)"
                    />
                    <input
                        type="text"
                        class="js-vlsm-subnets short-input"
                        aria-label="The subnet size"
                        placeholder="19"
                        required
                    />
                    <i class="js-add-subnet fas fa-plus-circle"></i>
                    <i
                        class="js-remove-subnet fas fa-minus-circle"
                    ></i>
                </div>
            </div>
            <button type="submit" class="btn">Get results</button>
        </form>
        <div class="soft-container">
            <div id="js-vlsm-chunks"></div>
        </div>
    </div>

    <!-- <h1>Supernetting</h1> -->
</div>

<?php $content = ob_get_clean();?>
<?php require_once PROJECT_ROOT . '/app/views/inc/layout.php';?>
