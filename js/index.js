/**
 * ABBREVIATIONS:
 * for shortenning variables names!
 * - CLF = classful
 * - CLS = classless
 * - LVL = level
 *
 * CONVENTION:
 * - OCTETS stored inside arrays MUST always be in string format
 * - Single ADDRESSES variables MUST always be in array format
 * - MASK & PREFIX MUST be formated & validated at the start of their main scope
 * - thrown errors preceeded with the comment EXCEPTION aren't meant to be catched
 *
 * ADD:
 * - Warn user when he enters subnet or broadcast @ as unicast address
 * - highligh the given IP inside the subnet
 * - Adopt OOP code
 * - VLSM net@ needs a validation function
 *
 * NOTE:
 * - variable named blocksize aren't so fidel to the name!! (255 mask exception)
 * - Can add an array to map number of available hosts using prefix as index
 *
 * This code is owned by medilies and released under the GPL3 licence
 */

// GLOBAL MAPPING ARRAYS. helps relating prefixes and subnetmasks
const allPrefixes = [
    [1, 2, 3, 4, 5, 6, 7, 8],
    [9, 10, 11, 12, 13, 14, 15, 16],
    [17, 18, 19, 20, 21, 22, 23, 24],
    [25, 26, 27, 28, 29, 30, 31, 32],
];
const maskDecimals = [128, 192, 224, 240, 248, 252, 254, 255];
// const maskBinaries = ["10000000","11000000","11100000","11110000","11111000","11111100","11111110","11111111"];

//******************
// FORMS ELEMENTS
//******************
const clfForm = document.querySelector("#js-clf-addressing");
const clfIp = document.querySelector("#js-clf-address");
const clfDiv = document.querySelector("#js-clf-info");

const clsForm = document.querySelector("#js-cls-addressing");
const clsIp = document.querySelector("#js-cls-address");
const clsPrefixOrMask = document.querySelector("#js-cls-mask-or-prefix");
const clsDiv = document.querySelector("#js-cls-info");
const clsClassLvlNeighborsDiv = document.querySelector(
    "#js-cls-neighbors-info"
);
const clsUpperPrefixesDiv = document.querySelector(
    "#js-cls-upper-prefixes-neighbors"
);

const vlsmForm = document.querySelector("#js-vlsm");
const vlsmSubnet = document.querySelector("#js-vlsm-network");
const vlsmInputs = document.querySelector("#js-vlsm-inputs");
const vlsmTemplateInput = document.querySelector("#vlsm-ref-input");

// Highligh the IP in the its subnet map
// Highlight the subnet next its neighbors
// warn the user if he gave a network or broadcast address that is cant be used for host

//*******************************************************
// FORMS SUBMISSION HANDLERS
//*******************************************************
clfForm.addEventListener("submit", (e) => {
    e.preventDefault();

    let ip = clfIp.value.toString();
    ip = toArrayAddress(ip);

    //VVVVVVVVVVVVVVVVVVVVVVVVVVVV handle the error
    ipv4RangeValidity(ip);

    const networkData = getClfIpData(ip);

    const subnetTable = subnetTableGen(networkData);
    clfDiv.innerHTML = subnetTable;
});

clsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    clsDiv.innerHTML = "";
    clsClassLvlNeighborsDiv.innerHTML = "";
    clsUpperPrefixesDiv.innerHTML = "";

    // will this make tracing error hard ?
    let ip = clsIp.value.toString();
    // >>>>>>>>>>>>>>>>>>>input needs to be formated as array
    let input = clsPrefixOrMask.value.toString();

    try {
        ip = toArrayAddress(ip);
        ipv4RangeValidity(ip);

        const { mask, prefix, intrestingOctetIndex } = extractPrefixAndMask(
            input
        );

        /**
         * Each part has the 3 following main steps
         * - Get info
         * - Generate table
         * - Put table into the page
         */

        //-------------------------
        // Part ONE
        //-------------------------

        // cut the crap at 31 and 32 prefixes
        if ([31, 32].includes(prefix))
            throw `There is no specs to analyse about the /${prefix} prefix`;

        const mainSubnetInfo = getClsIpData(ip, mask, intrestingOctetIndex);
        const subnetTable = subnetTableGen(mainSubnetInfo);
        clsDiv.innerHTML = subnetTable;

        //-------------------------
        // Part TWO
        //-------------------------

        // Same as if (classNeighboringSubnetsList !== "Main subnet is a class level subnet")
        if ([8, 16, 24].includes(prefix))
            throw "No class level neighbors to show";

        const classNeighboringSubnetsList = getClassNeighboringSubnets(
            toArrayAddress(mainSubnetInfo.subnetIp),
            mask,
            intrestingOctetIndex
        );
        const classNeighboringSubnetsTable = classNeighboringSubnetsTableGen(
            classNeighboringSubnetsList
        );
        clsClassLvlNeighborsDiv.innerHTML =
            `All the Possible /${prefix} subnets on ${
                classNeighboringSubnetsList[0].subnetIp
            }/${8 * parseInt(prefix / 8)}` + classNeighboringSubnetsTable;

        //-------------------------
        // Part THREE
        //-------------------------

        if ([0, 1, 8, 9, 16, 17, 24, 25].includes(prefix))
            throw "No prfix level neighbors to show";

        const prefixedNeighbors = getPrefixesNeighboringSubnets(
            toArrayAddress(mainSubnetInfo.subnetIp),
            prefix,
            mask,
            intrestingOctetIndex
        );
        const upperPrefixNeighboringSubnetsTable = upperPrefixNeighboringSubnetsTableGen(
            prefixedNeighbors
        );
        clsUpperPrefixesDiv.innerHTML =
            `<h4>Possible /${prefix} neighboring subnets on a varaition of larger prefixes</h4>` +
            upperPrefixNeighboringSubnetsTable;
    } catch (err) {
        // thrown from main scope
        if (err.includes("There is no specs to analyse about the /"))
            console.warn(err);
        else if (err === "No class level neighbors to show") console.warn(err);
        else if (err === "No prfix level neighbors to show") console.warn(err);
        // thrown from functions
        else if (err.includes("It may include an out of range [0-255] octet"))
            console.warn(err);
        else if (err === "Out of bound prefix") console.warn(err);
        else if (err.includes("invalid mask ")) console.warn(err);
        // *
        else console.error(`internal error: ${err}`);
    }
});

vlsmForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const cidrInput = vlsmSubnet.value.toString();

    const mainSubnet = cidrToSubnetAndPrefix(cidrInput);
    // refuse /30 /31 /32
    mainSubnet.intrestingOctetIndex = getIntrestingOctetIndexFromPreix(
        mainSubnet.prefix
    );
    mainSubnet.mask = prefix2mask(
        mainSubnet.prefix,
        mainSubnet.intrestingOctetIndex
    );
    mainSubnet.size = blockSizeFromPrefix(mainSubnet.prefix);

    const subnetSizes = document.querySelectorAll(".js-vlsm-subnets");
    const subnetNames = document.querySelectorAll(".js-vlsm-names");

    const vlsmChuncks = [];
    for (let i = 0; i < subnetSizes.length; i++) {
        vlsmChuncks.push({
            subnetName: subnetNames[i].value,
            subnetHosts: parseInt(subnetSizes[i].value),
            subnetOccupation: parseInt(subnetSizes[i].value) + 2,
        });
    }

    const neededSize = vlsmChuncks.reduce((acc, curr) => {
        // add broadcast & subnet @
        acc += parseInt(curr.subnetSize);
        return acc;
    }, 0);

    if (neededSize > mainSubnet.size)
        console.error("Main subnet capacity exceeded");

    // maybe sort and give the user a sorting choice
    vlsmChuncks.sort((a, b) => {
        if (parseInt(a.subnetHosts) > parseInt(b.subnetHosts)) {
            return -1;
        } else if (parseInt(a.subnetHosts) < parseInt(b.subnetHosts)) {
            return +1;
        } else {
            return 0;
        }
    });

    const addrPlaceHolder = [...mainSubnet.subnetAddr];

    vlsmChuncks.forEach((net) => {
        net.prefix = prefixFromSize(net.subnetOccupation);
        net.intrestingOctetIndex = getIntrestingOctetIndexFromPreix(net.prefix);
        net.mask = prefix2mask(net.prefix, net.intrestingOctetIndex);
        net.blockSize = blockSizeFromPrefix(net.prefix);
        net.subnetAddr = [...addrPlaceHolder];

        nextSubnetAddr(addrPlaceHolder, net.blockSize);
    });

    console.table(mainSubnet);
    console.table(vlsmChuncks);
});

vlsmInputs.addEventListener("click", vlsmAddRemoveCallback);

function warnReservedNetwork() {
    // ...
}

//*******************************************************
// GENERAL PURPOSE FUNCTIONS (the simplest ?)
//*******************************************************

/**
 * @param {string} address  formated as **"nb.nb.nb.nb"** or **"nb.nb.nb.nb/nb"**
 * @returns {string[]} address formated as **["nb","nb","nb","nb"]**
 */
function toArrayAddress(address) {
    // check if already formated as ["nb","nb","nb","nb"]
    if (Array.isArray(address) && address.length === 4) {
        console.warn("needless use for this function");
        return address;
    }
    // check if formated as "nb.nb.nb.nb/nb" then format it as "nb.nb.nb.nb"
    if (address.includes("/"))
        address = address.substr(0, address.indexOf("/"));
    // return "nb.nb.nb.nb" as ["nb","nb","nb","nb"]
    return address.split(".");
}

// checking masks would be better with a funtion that checks that all 1s in binary are on the left
/**
 * @param {string | number} octet gets verified if within [0-255]
 */
function octetRangeIsValid(octet) {
    octet = parseInt(octet);
    if (octet >= 0 && octet <= 255) return true;
    return false;
}

/**
 * returns true or throw error
 * @param {string[]} address
 * @requires octetRangeIsValid() applied on every octet
 * @requires toArrayAddress() EXTRA! used in case address isn't string[]
 * @throws out of range octet
 */
function ipv4RangeValidity(address) {
    if (!Array.isArray(address)) address = toArrayAddress(address);

    if (
        !octetRangeIsValid(address[0]) ||
        !octetRangeIsValid(address[1]) ||
        !octetRangeIsValid(address[2]) ||
        !octetRangeIsValid(address[3]) ||
        address.length !== 4
    )
        throw `The address ${address} is invalid! It may include an out of range [0-255] octet's value, or not be formed of exactly 4 octets`;
}

/**
 * @param {string[]} mask
 * @throw invalid mask
 */
function ipv4MaskValidity(mask) {
    if (!Array.isArray(mask)) mask = toArrayAddress(mask);

    if (mask.length !== 4) throw `invalid mask ${mask}`;

    mask.forEach((octet) => {
        if (!maskDecimals.includes(parseInt(octet)))
            throw `invalid mask ${mask}`;
    });
}

/**
 * @param {number} prefix
 * @throws "Out of bound prefix"
 * @throws "Bad function use" when param isn't an interger string or number
 */
function prefixRangeValidty(prefix) {
    // exception
    if (isNaN(prefix)) throw "Bad function use";
    if (prefix > 0 && prefix < 33) return true;
    throw "Out of bound prefix";
}

/**
 * First octet from left that isnt set to 255 is the intresting octet
 * @param {array} mask
 */
function getIntrestingOctetIndexFromMask(mask) {
    for (let i = 0; i <= 3; i++) {
        if (mask[i] !== "255" && mask[i] !== "0") return i;
        else if (mask[i - 1] === "255" && mask[i] === "0") return i - 1;
        else if (mask[i] === "255" && i === 3) return 3;
    }
    // exception
    throw "can't find intresting octet index";
}

/**
 * @param {number} prefix
 */
function getIntrestingOctetIndexFromPreix(prefix) {
    return parseInt((prefix - 1) / 8);
}

/**
 * **NOTE:** /8 /16 /24 /32 masks results in **blocksize === 1** because 256 - 255 = 1
 *
 * **=>** this behaviour is being exploited!
 *
 * needs to be replaced
 * @param {array} mask
 * @param {number} intrestingOctetIndex
 */
function blockSizeFromMask(mask, intrestingOctetIndex) {
    return 256 - mask[intrestingOctetIndex];
}

/**
 * @param {number} prefix
 */
function blockSizeFromPrefix(prefix) {
    return Math.pow(2, 32 - prefix);
}

/**
 * Can be applied on any address (any prefix, any value ...)
 *
 * returns an array of addresses[] Subnet, First host, Last Host, Broadcast
 * @param {array} ip used to map all other returned addresses
 * @param {array} mask used to get block size
 * @param {number} intrestingOctetIndex
 * @returns {string[] | number}
 */
function subnetMapping(ip, mask, intrestingOctetIndex) {
    const blockSize = blockSizeFromMask(mask, intrestingOctetIndex);

    const subnetIndex = parseInt(ip[intrestingOctetIndex] / blockSize);

    const subnetIp = ip.map((octet, i) => {
        if (i === intrestingOctetIndex)
            return (blockSize * subnetIndex).toString();
        if (i > intrestingOctetIndex) return "0";
        return octet;
    });

    const subnetBroadcastIp = ip.map((octet, i) => {
        // next subnet -1
        if (i === intrestingOctetIndex)
            return (blockSize * (subnetIndex + 1) - 1).toString();
        if (i > intrestingOctetIndex) return "255";
        return octet;
    });

    const firstHost = subnetIp.map((octet, i) => {
        if (i === 3) return (parseInt(octet) + 1).toString();
        return octet;
    });

    const lastHost = subnetBroadcastIp.map((octet, i) => {
        if (i === 3) return (parseInt(octet) - 1).toString();
        return octet;
    });

    const availabeHosts = hostsPerSubnet(intrestingOctetIndex, blockSize);

    return [subnetIp, firstHost, lastHost, subnetBroadcastIp, availabeHosts];
}

/**
 * Simple
 * used once in subnetMapping()
 * @param {number} intrestingOctetIndex
 * @param {number} blockSize
 */
function hostsPerSubnet(intrestingOctetIndex, blockSize) {
    switch (intrestingOctetIndex) {
        case 0:
            return 16777216 * blockSize - 2;
        case 1:
            return 65536 * blockSize - 2;
        case 2:
            return 256 * blockSize - 2;
        case 3:
            return 1 * blockSize - 2;
        default:
            // exception
            throw "index of octet can't be larger then 3";
    }
}

/**
 * **Strips** the "/" from the prefix if its formated as "/nb"
 *
 * ALSO **varifies VALIDITY**
 *
 * May requires extra refactoring ?
 * @param {string | number} prefix
 * @requires prefixRangeValidty() (throws exception)
 * @returns {number} prefix
 */
function decimalPrefix(prefix) {
    if (Number.isInteger(prefix)) {
        if (prefixRangeValidty(prefix)) return prefix;
    }

    // Not a integer then MUST be "/nb" or "nb"
    if (prefix.includes("/")) prefix = prefix.substr(1);

    prefix = parseInt(prefix);

    if (prefixRangeValidty(prefix)) return prefix;
}

/**
 * Simple & requires the global mapping arrays
 * @param {number} prefix
 * @param {number} intrestingOctetIndex
 */
function prefix2mask(prefix, intrestingOctetIndex) {
    let mask;

    // preset the mask
    switch (intrestingOctetIndex) {
        case 0:
            mask = ["0", "0", "0", "0"];
            break;
        case 1:
            mask = ["255", "0", "0", "0"];
            break;
        case 2:
            mask = ["255", "255", "0", "0"];
            break;
        case 3:
            mask = ["255", "255", "255", "0"];
            break;
        default:
            // exception
            throw "unexcpected intresting octet index value";
    }

    const mappingIndex = allPrefixes[intrestingOctetIndex].indexOf(prefix);

    // last modification on the preset mask
    mask[intrestingOctetIndex] = maskDecimals[mappingIndex].toString();

    return mask;
}

/**
 * Simple & requires the global mapping arrays
 * @param {array} mask
 * @param {number} intrestingOctetIndex  gives index of the subneted octet [0|1|2|3]
 */
function mask2prefix(mask, intrestingOctetIndex) {
    const mappingIndex = maskDecimals.indexOf(
        parseInt(mask[intrestingOctetIndex])
    );

    const prefix = allPrefixes[intrestingOctetIndex][mappingIndex];

    return prefix;
}

/**
 * Returns **VALID** mask & prefix
 * used when form input allows user to enter one option. PREFIX or MASK, and futur operations requires both
 * @param {string} input
 * @requires ipv4RangeValidity()
 * @requires getIntrestingOctetIndexFromMask()
 * @requires mask2prefix()
 * @requires prefix2mask()
 * @throws "invalid values in mask"
 */
function extractPrefixAndMask(input) {
    let mask = [];
    let prefix;
    let intrestingOctetIndex;

    // Mask
    if (input.length > 6) {
        ipv4MaskValidity(input);

        mask = toArrayAddress(input);
        intrestingOctetIndex = getIntrestingOctetIndexFromMask(mask);
        prefix = mask2prefix(mask, intrestingOctetIndex);
    }
    // Prefix
    else if (input.length < 4) {
        prefix = decimalPrefix(input);
        intrestingOctetIndex = getIntrestingOctetIndexFromPreix(prefix);
        mask = prefix2mask(prefix, intrestingOctetIndex);
    }
    // exception
    else throw "unexpected input length while extracting mask & prefix";

    return { mask, prefix, intrestingOctetIndex };
}

/**
 * @param {string} firstOctet
 * @requires octetRangeIsValid()
 * @throws "invalide first octet" when first octet isn't in [0-255]
 */
function getClassOfIp(firstOctet) {
    firstOctet = parseInt(firstOctet);

    // exception
    if (!octetRangeIsValid(firstOctet)) throw "invalide first octet";

    if (firstOctet >= 0 && firstOctet <= 127) return "class A";
    if (firstOctet >= 128 && firstOctet <= 191) return "class B";
    if (firstOctet >= 192 && firstOctet <= 223) return "class C";
    if (firstOctet >= 224 && firstOctet <= 239) return "class D";
    if (firstOctet >= 240 && firstOctet <= 255) return "class E";
}

/**
 * From w3c JS docs
 * @param {string} dec
 */
function dec2bin(dec) {
    return (dec >>> 0).toString(2);
}

/**
 * From w3c JS docs
 * @param {string} bin
 */
function bin2dec(bin) {
    return parseInt(bin, 2).toString(10);
}

/**
 *
 * @param {string | number} a
 * @param {string | number} b
 */
function addBin(a, b) {
    let sum = parseInt(a) + parseInt(b);
    return (sum >>> 0).toString(2);
}

/**
 * @param {number} size
 */
function prefixFromSize(size) {
    let hostsBits;
    for (let i = 0; i < 32; i++) {
        if (Math.pow(2, i) >= size) {
            hostsBits = i;
            break;
        }
    }
    return 32 - hostsBits;
}

/**
 *
 * @param {string} cidr "nb.nb.nb.nb/nb"
 * @requires toArrayAddress
 * @requires decimalPrefix
 * @throw wrong CIDR notation
 */
function cidrToSubnetAndPrefix(cidr) {
    if (cidr.includes("/")) cidr = cidr.split("/");
    else throw "Cidr notation must include / character";

    const subnetAddr = toArrayAddress(cidr[0]);
    const prefix = decimalPrefix(cidr[1]);
    return { subnetAddr, prefix };
}

//*******************************************************
// HTML TABLE GENERATION  FUNCTIONS
//*******************************************************

/**
 * Used in for any single subnet (classless/classful)
 *
 * @param {*} info The object containning network or subnet data {Subnet, firstHost, lastHost, broadcast, available hosts ...}
 *
 * needs to include prefixe
 */
function subnetTableGen(info) {
    return `
    <table>
        <tr>
            <th>${info.ipClass == undefined ? "Subnet" : "Network"} address</th>
            <td>${info.subnetIp}</td>
            </tr>
        <tr>
            <th>First host</th>
            <td>${info.firstHost}</td>
        </tr>
        <tr>
            <th>Last host</th>
            <td>${info.lastHost}</td>
        </tr>
        <tr>
            <th>Broadcast address</th>
            <td>${info.subnetBroadcastIp}</td>
        </tr>
        <tr>
            <th>Subnetmask</th>
            <td>${info.subnetMask}</td>
        </tr>
        ${
            info.ipClass == undefined
                ? ""
                : `<tr><th>Class</th><td>${info.ipClass}</td></tr>`
        }
        <tr>
            <th>Number of Availabe hosts</th>
            <td>${info.availabeHosts}</td>
        </tr>
    </table>`;
}

/**
 * @param {*} neighboringInfo
 */
function classNeighboringSubnetsTableGen(neighboringInfo) {
    let table = `<table>
    <tr>
        <th></th>
        <th>Subnet address</th>
        <th>First host</th>
        <th>Last host</th>
        <th>Broadcast address</th>
    </tr>`;
    neighboringInfo.forEach((subnet, i) => {
        table += `
        <tr>
            <th>${i + 1}</th>
            <td>${subnet.subnetIp}</td>
            <td>${subnet.firstHost}</td>
            <td>${subnet.lastHost}</td>
            <td>${subnet.subnetBroadcastIp}</td>
        </tr>`;
    });
    table += "</table>";
    return table;
}

/**
 * The result table has "SubnetListsIterators.length"|"prefixedNeighbors.length" columns & "largestSubnetsList.length" rows
 *
 * a bit complexe to explain just debug it to understand
 *
 * @param {*} prefixedNeighbors
 */
function upperPrefixNeighboringSubnetsTableGen(prefixedNeighbors) {
    // empty in case the user inputed an address with 8,16,24 prefix!

    // exception
    if (prefixedNeighbors.length === 0) throw "Input is empty";

    prefixedNeighbors.reverse();
    // largest list is the one with with smallest prefix
    const largestSubnetsList = prefixedNeighbors[0].subnets;

    // [0,0,0...]
    const SubnetListsIterators = prefixedNeighbors.map(() => {
        return 0;
    });

    let table = "<table>";
    // headers row
    table += "<tr>";
    prefixedNeighbors.forEach((subnetsList) => {
        table += `<th>${subnetsList.subnets[0]}/${subnetsList.prefix}</th>`;
    });
    table += "</tr>";

    // CORE LOOP
    largestSubnetsList.forEach((subnet) => {
        table += "<tr>";

        for (let i = 0; i < SubnetListsIterators.length; i++) {
            const currentSubnetsList = prefixedNeighbors[i].subnets;

            if (subnet === currentSubnetsList[SubnetListsIterators[i]]) {
                table += `<td>${subnet}</td>`;
                SubnetListsIterators[i]++;
            }
            //*
            else table += "<td></td>";
        }

        table += "</tr>";
    });

    table += "</table>";

    return table;
}

//*******************************************************
// CASE SPECIFIC FUNCTIONS (called once)
//*******************************************************

/**
 * The main function in classful IP option
 *
 * Asselble related data in a meanningful object
 * @param {string[]} ip
 * @requires getClassOfIp()
 * @requires subnetMapping()
 * @throws "unexpected class of IP"
 */
function getClfIpData(ip) {
    let networkOctets;
    let availabeHosts;
    let mask;

    const ipClass = getClassOfIp(ip[0]);

    switch (ipClass) {
        case "class A":
            networkOctets = 0;
            availabeHosts = 16777214;
            mask = "255.0.0.0";
            break;
        case "class B":
            networkOctets = 1;
            availabeHosts = 65534;
            mask = "255.255.0.0";
            break;
        case "class C":
            networkOctets = 2;
            availabeHosts = 254;
            mask = "255.255.255.0";
            break;
        default:
            // exception
            throw "unexpected class of IP";
    }

    const subnetMap = subnetMapping(ip, toArrayAddress(mask), networkOctets);

    return {
        subnetIp: subnetMap[0].join("."),
        firstHost: subnetMap[1].join("."),
        lastHost: subnetMap[2].join("."),
        subnetBroadcastIp: subnetMap[3].join("."),
        subnetMask: mask,
        ipClass: ipClass,
        availabeHosts: availabeHosts,
    };
}

/**
 * The main function in classless IP option
 *
 * Asselble related data in a meanningful object
 * @param {string[]} ip
 * @param {string[]} mask
 * @param {number} intrestingOctetIndex
 * @requires subnetMapping() The only operation!
 */
function getClsIpData(ip, mask, intrestingOctetIndex) {
    const subnetMap = subnetMapping(ip, mask, intrestingOctetIndex);

    return {
        subnetIp: subnetMap[0].join("."),
        firstHost: subnetMap[1].join("."),
        lastHost: subnetMap[2].join("."),
        subnetBroadcastIp: subnetMap[3].join("."),
        subnetMask: mask.join("."),
        availabeHosts: subnetMap[4],
    };
}

/**
 * Assumes FIXED Length Subneting
 *
 * **EXAMPLE** main subnet is 192.168.1.112/29
 *
 * This function will return all /29 subnets contained within 192.168.1.0/24
 *
 * @param {string[]} mainSubnet
 * @param {string[]} mask
 * @param {number} intrestingOctetIndex
 */
function getClassNeighboringSubnets(mainSubnet, mask, intrestingOctetIndex) {
    if (mask[intrestingOctetIndex] == "255")
        return "Main subnet is a class level subnet";

    const blockSize = blockSizeFromMask(mask, intrestingOctetIndex);
    const currentSubnet = mainSubnet;
    const subnets = [];

    for (let theOctet = 0; theOctet < 256; theOctet += blockSize) {
        currentSubnet[intrestingOctetIndex] = theOctet.toString();

        currentSubnetMap = subnetMapping(
            currentSubnet,
            mask,
            intrestingOctetIndex
        );

        subnets.push({
            subnetIp: currentSubnetMap[0].join("."),
            firstHost: currentSubnetMap[1].join("."),
            lastHost: currentSubnetMap[2].join("."),
            subnetBroadcastIp: currentSubnetMap[3].join("."),
        });
    }
    return subnets;
}

/**
 * /8 /16 /24 prefixes causes inexpected behviour **(results blocksize of 1 ?)**
 *
 * LOCATES the larger subnet that wraps main subnet & its neighbors
 *
 * THEN return all the little subnets in strings array
 * @param {string[]} mainSubnet
 * @param {string[]} mainSubnetMask
 * @param {number} intrestingOctetIndex
 * @param {number} targetPrefix values can be: **[1-7][9-15][17-23][25-30]**
 * @requires prefix2mask()
 * @requires blockSizeFromMask()
 * @throws classful problems
 */
function upperSubnetNeighbors(
    mainSubnet,
    mainSubnetMask,
    intrestingOctetIndex,
    targetPrefix
) {
    // exception
    if ([8, 16, 24].includes(targetPrefix))
        throw "This function doesn't locate neighbors inside /8, /16 or /24";

    // exception
    if (mainSubnetMask[intrestingOctetIndex] == "255")
        throw "This function doesn't locate neighbors for Class level subnets";

    // Locate the larger subnet that wraps the Main Subnet
    const targetMask = prefix2mask(targetPrefix, intrestingOctetIndex);
    const targetBlockSize = blockSizeFromMask(targetMask, intrestingOctetIndex);
    const parentSubnetIndex = Math.floor(
        mainSubnet[intrestingOctetIndex] / targetBlockSize
    );

    // set Main Subnet blocksize to iterate with through neighbors
    const iterativeBlockSize = blockSizeFromMask(
        mainSubnetMask,
        intrestingOctetIndex
    );

    // loop variables
    const currentSubnet = mainSubnet;
    let theOctet = targetBlockSize * parentSubnetIndex;
    const subnets = [];

    /**
     * EXAMPLE /28.blocksize===16 /26.blocksize===64 => 0:16:64
     *     192.168.1.[64,80,96,112]/28 indide 192.168.1.64/26
     */
    for (let i = 0; i < targetBlockSize; i += iterativeBlockSize) {
        currentSubnet[intrestingOctetIndex] = theOctet.toString();

        subnets.push(currentSubnet.join("."));

        theOctet += iterativeBlockSize;
    }

    return { subnets: subnets, prefix: targetPrefix };
}

/**
 * Just wrap upperSubnetNeighbors() Results for larger prefixes in a array
 *
 * **EXAMPLE:** if the studied prefix is **28**, this function will loop with upperSubnetNeighbors() and get info of /27 /26 /25 focusing on the /28
 *
 * The **for loop** starts at studiedPrefix-1. That's why /1 /9 /17 /25 are excluded, Because 25-1=24 (24===stop prefix) => then the function retuns an **empty Array**
 *
 * Also /0 /8 /16 /24 are covered by **getClassNeighboringSubnets()**
 * @param {string[]} mainSubnetAddress
 * @param {number} prefix values can be: **[2-7][10-15][18-23][26-30]**
 * @param {string[]} mask
 * @param {number} intrestingOctetIndex
 * @requires upperSubnetNeighbors()
 */
function getPrefixesNeighboringSubnets(
    mainSubnetAddress,
    prefix,
    mask,
    intrestingOctetIndex
) {
    // exception
    if ([8, 16, 24].includes(prefix))
        throw "/8 /16 /24 can't be proceced for this function";

    // exception
    if ([1, 9, 17, 25].includes(prefix))
        throw "/1 /9 /17 /25 will results in returning an empty set";

    const stopPrefix = Math.floor(prefix / 8) * 8;
    const prefixedNeighbors = [];

    for (let i = prefix - 1; i > stopPrefix; i--) {
        const currentPrefixNeighbors = upperSubnetNeighbors(
            mainSubnetAddress,
            mask,
            intrestingOctetIndex,
            i
        );
        prefixedNeighbors.push(currentPrefixNeighbors);
    }

    return prefixedNeighbors;
}

function vlsmAddRemoveCallback(e) {
    e.preventDefault();

    if (e.target.classList.contains("add-subnet")) {
        vlsmInputs.appendChild(vlsmTemplateInput.cloneNode(true));
    } else if (e.target.classList.contains("remove-subnet")) {
        e.target.parentElement.remove();
    }
}

/**
 * **STEPS**
 * - get current subnet address
 * - tranform current subnet address from DEC2BIN
 * - - add padding 0s for each octet if it isn't 8 bits long
 * - format current subnet address from array to string
 * - add current block size to current subnet address : gets next next subnet address
 * - add padding 0 bits if it isn't 32 bits long
 * - format next subnet address from string to array
 * - tranform next subnet address from BIN2DEC
 * @param {string[]} subnetAddr passed by reference
 * @param {number} blockSize
 */
function nextSubnetAddr(subnetAddr, blockSize) {
    // write octets in binary
    subnetAddr.forEach((octet, i) => {
        octet = dec2bin(octet);

        // left padding 0 bits
        if (octet.length < 8) {
            const breakOut = 8 - octet.length;
            for (let i = 0; i < breakOut; i++) {
                octet = "0" + octet;
            }
        }

        subnetAddr[i] = octet;
    });

    // fuse the octets: 32 chars string
    const binSubnetAddr = subnetAddr.join("");

    // addition
    let nextSubentAddr = addBin(bin2dec(binSubnetAddr), blockSize);

    // left padding 0 bits
    if (nextSubentAddr.length < 32) {
        const breakOut = 32 - nextSubentAddr.length;
        for (let i = 0; i < breakOut; i++) {
            nextSubentAddr = "0" + nextSubentAddr;
        }
    }

    // spliting the binary string
    subnetAddr[0] = nextSubentAddr.substr(-32, 8);
    subnetAddr[1] = nextSubentAddr.substr(-24, 8);
    subnetAddr[2] = nextSubentAddr.substr(-16, 8);
    subnetAddr[3] = nextSubentAddr.substr(-8, 8);

    // transforming the binary octets to decimal
    subnetAddr.forEach((octet, i) => {
        octet = bin2dec(octet);
        subnetAddr[i] = octet;
    });

    // the end result is passed by reference
}
