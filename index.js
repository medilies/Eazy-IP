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
 *
 * ADD:
 * - Warn user when he enters subnet or broadcast @ as unicast address
 * - Show the given IP inside the subnet
 * - function that check masks validity in binary
 * - Adopt OOP code
 *
 * NOTE:
 * - variable named blocksize aren't so fidel to the name!! (255 mask exception)
 * - Can add an array to map number of available hosts using prefix as index
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
    if (ipv4RangeValidity(ip) !== true) console.error("invalid values in ip");

    const networkData = getClfIpData(ip);

    const subnetTable = subnetTableGen(networkData);
    clfDiv.innerHTML = subnetTable;
});

clsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    clsDiv.innerHTML = "";
    clsClassLvlNeighborsDiv.innerHTML = "";
    clsUpperPrefixesDiv.innerHTML = "";

    let ip = clsIp.value.toString();
    // >>>>>>>>>>>>>>>>>>>input needs to be formated as array
    let input = clsPrefixOrMask.value.toString();

    ip = toArrayAddress(ip);
    if (ipv4RangeValidity(ip) !== true) console.error("invalid values in ip");

    const { mask, prefix, intrestingOctetIndex } = extractPrefixAndMask(input);

    //-------------------------
    // Part ONE
    //-------------------------

    // cut the crap at 31 and 32 prefixes
    if (prefix == 32 || prefix == 31) {
        console.warn("This is an exceptional subnet");
        return;
    }

    const mainSubnetInfo = getClsIpData(ip, mask, intrestingOctetIndex);
    const subnetTable = subnetTableGen(mainSubnetInfo);
    clsDiv.innerHTML = subnetTable;

    /**
     * Each part has the 3 following main steps
     * - Get info
     * - Generate table
     * - Put table into the page
     */
    //-------------------------
    // Part TWO
    //-------------------------

    // adapt promesses scheme!
    // Same as if (classNeighboringSubnetsList !== "Main subnet is a class level subnet")
    if (prefix == 8 || prefix == 16 || prefix == 24) {
        console.warn("following operations doesn't apply for this prefix/mask");
        return;
    }

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

    // adapt promesses scheme!
    if (
        prefix - 1 == 0 ||
        prefix - 1 == 8 ||
        prefix - 1 == 16 ||
        prefix - 1 == 24
    ) {
        console.warn(
            "On the given prefix. The following opeations data have already been provided in previous operation"
        );
        return;
    }

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
});

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
 * MUST be compared with true : **if Result===true**
 * @param {string[]} address
 * @requires octetRangeIsValid() applied on every octet
 * @requires toArrayAddress() EXTRA! used in case address isn't string[]
 */
function ipv4RangeValidity(address) {
    let report = "";

    if (!Array.isArray(address)) address = toArrayAddress(address);

    if (address.length !== 4) report += "<br>Address doesn't have 4 octets";

    // replcae this with html text
    report += `${octetRangeIsValid(address[0]) ? "" : "<br>invalid 1st octet"}${
        octetRangeIsValid(address[1]) ? "" : "<br>invalid 2nd octet"
    }${octetRangeIsValid(address[2]) ? "" : "<br>invalid 3rd octet"}${
        octetRangeIsValid(address[3]) ? "" : "<br>invalid 4th octet"
    }`;

    if (report === "") return true;
    return report;
}

/**
 * @param {number} prefix
 */
function prefixRangeValidty(prefix) {
    if (prefix > 0 && prefix < 33) return true;
    return false;
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
    throw "didn't find intresting octet index";
}

/**
 * **NOTE:** /8 /16 /24 /32 masks results in **blocksize === 1** because 256 - 255 = 1
 *
 * **=>** this behaviour is being exploited!
 * @param {array} mask
 * @param {number} intrestingOctetIndex
 */
function getBlockSize(mask, intrestingOctetIndex) {
    return 256 - mask[intrestingOctetIndex];
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
    const blockSize = getBlockSize(mask, intrestingOctetIndex);

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
            throw "index of octet cant be larger then 3";
    }
}

/**
 * **Strips** the "/" from the prefix if its formated as "/nb"
 *
 * ALSO **varifies VALIDITY**
 *
 * May requires extra refactoring ?
 * @param {string | number} prefix
 * @returns {number} prefix
 * @throws ...
 */
function decimalPrefix(prefix) {
    if (Number.isInteger(prefix)) {
        if (prefixRangeValidty(prefix)) return prefix;
        else throw "Out of bound prefix";
    }

    // Not a integer then MUST be "/nb" or "nb"
    if (prefix.includes("/")) prefix = prefix.substr(1);

    prefix = parseInt(prefix);

    if (prefixRangeValidty(prefix)) return prefix;
    else throw "Out of bound prefix";
}

/**
 * Simple & requires the global mapping arrays
 * @param {number} prefix
 * @param {number} intrestingOctetIndex
 */
function prefixToMask(prefix, intrestingOctetIndex) {
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
            console.error("weird");
            break;
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
function maskToPrefix(mask, intrestingOctetIndex) {
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
 * @requires maskToPrefix()
 * @requires prefixToMask()
 * @throws "invalid values in mask"
 */
function extractPrefixAndMask(input) {
    let mask = [];
    let prefix;
    let intrestingOctetIndex;

    // Mask
    if (input.length > 6) {
        // needs a new validity test function => all 1 bits on left
        if (ipv4RangeValidity(input) !== true) throw "invalid values in mask";

        mask = toArrayAddress(input);
        intrestingOctetIndex = getIntrestingOctetIndexFromMask(mask);
        prefix = maskToPrefix(mask, intrestingOctetIndex);
    }
    // Prefix
    else if (input.length < 4) {
        prefix = decimalPrefix(input);
        intrestingOctetIndex = parseInt((prefix - 1) / 8);
        mask = prefixToMask(prefix, intrestingOctetIndex);
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

    if (!octetRangeIsValid(firstOctet)) throw "invalide first octet";

    if (firstOctet >= 0 && firstOctet <= 127) return "class A";
    if (firstOctet >= 128 && firstOctet <= 191) return "class B";
    if (firstOctet >= 192 && firstOctet <= 223) return "class C";
    if (firstOctet >= 224 && firstOctet <= 239) return "class D";
    if (firstOctet >= 240 && firstOctet <= 255) return "class E";
}

// UNUSED:

/**
 * octet can be int or string between 0 & 255
 * Returns a binary octet in string format
 */
function decimalToBinary(decimalOctet) {
    decimalOctet = parseInt(decimalOctet);
    if (!octetRangeIsValid(decimalOctet)) console.error("invalide octet");

    let bin = "";
    let rest;
    for (let i = 0; i < 8; i++) {
        rest = decimalOctet % 2;
        decimalOctet = parseInt(decimalOctet / 2);
        bin = rest + bin;
    }
    return bin;
}

/**
 *
 * @param {string} binaryOctet
 */
function binaryToDecimal(binaryOctet) {
    let decimal = 0;
    let power = 7;
    for (let i = 0; i < 8; i++) {
        if (binaryOctet[i] === "1") decimal += Math.pow(2, power);
        power--;
    }
    return decimal;
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

    const blockSize = getBlockSize(mask, intrestingOctetIndex);
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
 * @requires prefixToMask()
 * @requires getBlockSize()
 * @throws classful problems
 */
function upperSubnetNeighbors(
    mainSubnet,
    mainSubnetMask,
    intrestingOctetIndex,
    targetPrefix
) {
    if (targetPrefix == 8 || targetPrefix == 16 || targetPrefix == 24)
        throw "class level subnet aren't handled here";

    if (mainSubnetMask[intrestingOctetIndex] == "255")
        throw "This function doesn't locate Class level subnets neighbors";

    // Locate the larger subnet that wraps the Main Subnet
    const targetMask = prefixToMask(targetPrefix, intrestingOctetIndex);
    const targetBlockSize = getBlockSize(targetMask, intrestingOctetIndex);
    const parentSubnetIndex = Math.floor(
        mainSubnet[intrestingOctetIndex] / targetBlockSize
    );

    // set Main Subnet blocksize to iterate with through neighbors
    const iterativeBlockSize = getBlockSize(
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
    if (prefix == 8 || prefix == 16 || prefix == 24)
        throw "class level subnet aren't handled here";

    if (prefix == 1 || prefix == 9 || prefix == 17 || prefix == 25)
        throw "Insupported prefix for getting upper subnets neighbors";

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
