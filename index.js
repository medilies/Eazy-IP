/**
 * ADD:
 * - Warn user when he enters subnet or broadcast @ as unicast address
 * - Show the given IP inside the subnet
 *
 * NOTE:
 * - variable named blocksize aren't so fidel to the name!!
 * - Can add an array to map number of available hosts using prefix as index
 */

// Mapping arrays
const allPrefixes = [
    [1, 2, 3, 4, 5, 6, 7, 8],
    [9, 10, 11, 12, 13, 14, 15, 16],
    [17, 18, 19, 20, 21, 22, 23, 24],
    [25, 26, 27, 28, 29, 30, 31, 32],
];
const maskDecimals = [128, 192, 224, 240, 248, 252, 254, 255];
// const maskBinaries = ["10000000","11000000","11100000","11110000","11111000","11111100","11111110","11111111"];

// forms elements
const classfulForm = document.querySelector("#js-classful-addressing");
const classfulIp = document.querySelector("#js-classful-address");
const classfulInfoDiv = document.querySelector("#js-classful-info");

const classlessForm = document.querySelector("#js-classless-addressing");
const classlessIp = document.querySelector("#js-classfless-address");
const classlessPrefixOrMask = document.querySelector(
    "#js-classfless-mask-or-prefix"
);
const classlessInfoDiv = document.querySelector("#js-classless-info");
const classlessClassLevelNeighborsInfoDiv = document.querySelector(
    "#js-classless-neighbors-info"
);
const classlessUpperPrefixesDiv = document.querySelector(
    "#js-classless-upper-prefixes-neighbors"
);

// Highligh the IP in the its subnet map
// Highlight the subnet next its neighbors
// warn the user if he gave a network or broadcast address that is cant be used for host

classfulForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let ip = classfulIp.value.toString();
    ip = arrayIp(ip);
    if (ipv4RangeValidity(ip) !== true) console.error("invalid values in ip");

    const networkInfo = classfulIpInfo(ip);
    // console.table(networkInfo);

    const subnetTable = subnetTableGen(networkInfo);
    classfulInfoDiv.innerHTML = subnetTable;
});

classlessForm.addEventListener("submit", (e) => {
    e.preventDefault();
    classlessInfoDiv.innerHTML = "";
    classlessClassLevelNeighborsInfoDiv.innerHTML = "";
    classlessUpperPrefixesDiv.innerHTML = "";

    let ip = classlessIp.value.toString();
    let input = classlessPrefixOrMask.value.toString();

    ip = arrayIp(ip);
    if (ipv4RangeValidity(ip) !== true) console.error("invalid values in ip");

    //-------------------------
    // Part ONE
    //-------------------------
    const { mask, prefix, intrestingOctetIndex } = extractPrefixAndMask(input);

    // cut the crap at 31 and 32 prefixes
    if (prefix == 32 || prefix == 31) {
        console.warn("This is an exceptional subnet");
        return;
    }

    const mainSubnetInfo = classlessIpInfo(ip, mask, intrestingOctetIndex);
    const subnetTable = subnetTableGen(mainSubnetInfo);
    classlessInfoDiv.innerHTML = subnetTable;

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
        mainSubnetInfo.subnetIp,
        mask,
        intrestingOctetIndex
    );
    const classNeighboringSubnetsTable = classNeighboringSubnetsTableGen(
        classNeighboringSubnetsList
    );
    classlessClassLevelNeighborsInfoDiv.innerHTML =
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
        mainSubnetInfo.subnetIp,
        prefix,
        mask,
        intrestingOctetIndex
    );
    const upperPrefixNeighboringSubnetsTable = upperPrefixNeighboringSubnetsTableGen(
        prefixedNeighbors
    );
    classlessUpperPrefixesDiv.innerHTML =
        `<h4>Possible /${prefix} neighboring subnets on a varaition of larger prefixes</h4>` +
        upperPrefixNeighboringSubnetsTable;
});

/**
 * Doesn't function on 8,16,24 prefixes due inexpected behviour detecting their intrestingOctet
 * @param {*} mainSubnet
 * @param {*} mainSubnetMask
 * @param {*} intrestingOctetIndex
 * @param {*} targetPrefix
 */
function upperSubnetNeighbors(
    mainSubnet,
    mainSubnetMask,
    intrestingOctetIndex,
    targetPrefix
) {
    if (targetPrefix == 8 || targetPrefix == 16 || targetPrefix == 24)
        return "This doesn't a class level subnet's subnets";

    if (mainSubnetMask[intrestingOctetIndex] == "255")
        return "This function doesn't locate Class level subnets neighbors";

    mainSubnet = arrayIp(mainSubnet);
    const targetMask = prefixToMask(targetPrefix, intrestingOctetIndex);
    const targetBlockSize = getBlockSize(targetMask, intrestingOctetIndex);
    const parentSubnetIndex = parseInt(
        mainSubnet[intrestingOctetIndex] / targetBlockSize
    );

    const iterativeBlockSize = getBlockSize(
        mainSubnetMask,
        intrestingOctetIndex
    );

    let theOctet = targetBlockSize * parentSubnetIndex;
    const subnets = [];

    for (let i = 0; i < targetBlockSize; i += iterativeBlockSize) {
        // from now on mainsubnet looses its meanning. its just an IP array
        mainSubnet[intrestingOctetIndex] = theOctet.toString();
        subnets.push(mainSubnet.join("."));
        theOctet += iterativeBlockSize;
    }

    // console.log(subnets);
    return { subnets: subnets, prefix: targetPrefix };
}

// adapt to promesses
function classfulIpInfo(ip) {
    const ipClass = getClassOfIp(ip[0]);
    let networkOctets;
    let availabeHosts;
    let mask;

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
            console.error("u cant work with this class");
            break;
    }

    const subnetMap = subnetMapping(ip, arrayIp(mask), networkOctets);

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

function classlessIpInfo(ip, mask, intrestingOctetIndex) {
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
 * all IPs are in a array format
 * @param {*} ip
 * @param {*} mask
 * @param {*} intrestingOctetIndex
 */
function subnetMapping(ip, mask, intrestingOctetIndex) {
    const blockSize = getBlockSize(mask, intrestingOctetIndex);

    const subnetIndex = parseInt(ip[intrestingOctetIndex] / blockSize);
    // console.log(intrestingOctetIndex, blockSize, subnetIndex);

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
 * The math in this function can be replaced by a mapping array All possibilities indexed with prefix
 * @param {*} intrestingOctetIndex
 * @param {*} blockSize
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
 * Assumes FIXED Length Subneting
 * @param {*} mainSubnet
 * @param {*} mask
 * @param {*} intrestingOctetIndex
 */
function getClassNeighboringSubnets(mainSubnet, mask, intrestingOctetIndex) {
    if (mask[intrestingOctetIndex] == 255)
        return "Main subnet is a class level subnet";

    const blockSize = getBlockSize(mask, intrestingOctetIndex);
    const currentSubnet = arrayIp(mainSubnet);
    const subnets = [];
    for (let i = 0; i < 256; i += blockSize) {
        currentSubnet[intrestingOctetIndex] = i.toString();
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

function getPrefixesNeighboringSubnets(
    mainSubnetAddress,
    prefix,
    mask,
    intrestingOctetIndex
) {
    const stopPrefix = parseInt(prefix / 8) * 8;
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

function extractPrefixAndMask(input) {
    let mask = [];
    let prefix;
    let intrestingOctetIndex;
    // Mask
    if (input.length > 5) {
        // needs a new vality test function => all 1 bits on left
        if (ipv4RangeValidity(input) !== true)
            console.error("invalid values in mask");

        mask = arrayIp(input);
        intrestingOctetIndex = getIntrestingOctetIndexFromMask(mask);
        prefix = maskToPrefix(mask, intrestingOctetIndex);
    }
    // Prefix
    if (input.length < 5) {
        prefix = decimalPrefix(input);
        intrestingOctetIndex = parseInt((prefix - 1) / 8);
        mask = prefixToMask(prefix, intrestingOctetIndex);
    }
    // console.log(mask, prefix);

    return { mask, prefix, intrestingOctetIndex };
}

/**
 * intresting octet gives index of the subneted octet [0|1|2|3]
 */
function maskToPrefix(mask, intrestingOctetIndex) {
    const mappingIndex = maskDecimals.indexOf(
        parseInt(mask[intrestingOctetIndex])
    );
    const prefix = allPrefixes[intrestingOctetIndex][mappingIndex];
    return prefix;
}

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

    // 8,16,24 prefixes has their intrestingOctetIndex+1
    const mappingIndex = allPrefixes[intrestingOctetIndex].indexOf(prefix);
    // console.log(mappingIndex, prefix, intrestingOctetIndex);

    // last modification on the preset mask
    mask[intrestingOctetIndex] = maskDecimals[mappingIndex].toString();
    return mask;
}

/**
 * First octet from left that isnt set to 255 is the intresting octet
 */
function getIntrestingOctetIndexFromMask(mask) {
    // loop through the 4 octets
    for (let i = 0; i <= 3; i++) {
        if (mask[i] !== "255" && mask[i] !== "0") return i;
        else if (mask[i - 1] === "255" && mask[i] === "0") return i - 1;
        else if (mask[i] === "255" && i === 3) return 3;
    }
    console.error("didnt find intresting octet");
}

/**
 * 8, 16, 24, 32 prefixes' masks give blocksize of 1 bcz 256 - 255 = 1
 * this type of behaviour is being exploited!
 * @param {*} mask array
 * @param {*} intrestingOctetIndex 0-3
 */
function getBlockSize(mask, intrestingOctetIndex) {
    return 256 - mask[intrestingOctetIndex];
}

/**
 * takes "nb.nb.nb.nb" or "nb.nb.nb.nb/nb" and returns ["nb","nb","nb","nb"]
 */
function arrayIp(ip) {
    // check if formated as ["nb","nb","nb","nb"]
    if (Array.isArray(ip) && ip.length === 4)
        console.warn("needless use for this function");
    // if not array then string
    // check if formated as "nb.nb.nb.nb/nb" then format it as "nb.nb.nb.nb"
    if (ip.includes("/")) ip = ip.substr(0, ip.indexOf("/"));
    // return "nb.nb.nb.nb" as ["nb","nb","nb","nb"]
    return ip.split(".");
}

/**
 * uses octetRangeIsValid() on every octet
 */
function ipv4RangeValidity(ip) {
    let report = "";
    if (!Array.isArray(ip)) ip = arrayIp(ip);
    if (ip.length !== 4) report += "IP do not have 4 octets/";

    // replcae this with html text
    report += `${octetRangeIsValid(ip[0]) ? "" : "/invalid A octet"}${
        octetRangeIsValid(ip[1]) ? "" : "/invalid B octet"
    }${octetRangeIsValid(ip[2]) ? "" : "/invalid C octet"}${
        octetRangeIsValid(ip[3]) ? "" : "/invalid D octet"
    }`;

    if (report === "") return true;
    return report;
}

/**
 * Integer or string within [0-255]
 */
function octetRangeIsValid(octet) {
    // console.log(octet);
    octet = parseInt(octet);
    if (octet >= 0 && octet <= 255) return true;
    return false;
}

function decimalPrefix(prefix) {
    // need more precises way to check IsInt?
    if (!isNaN(prefix) && prefix >= 1 && prefix <= 32) return parseInt(prefix);
    // string "/nb" to "nb"
    if (prefix.includes("/")) prefix = prefix.substr(1);
    prefix = parseInt(prefix);
    if (prefix <= 0 || prefix >= 33) throw "impossible prefix";
    else return prefix;
}

function warnReservedNetwork() {
    // ...
}

/**
 * octet can be int or string between 0 & 255
 * Returns a binary octet in string format
 */
function decimalToBinary(octet) {
    octet = parseInt(octet);
    if (!octetRangeIsValid(octet)) console.error("invalide octet");

    let bin = "";
    let rest;
    for (let i = 0; i < 8; i++) {
        rest = octet % 2;
        octet = parseInt(octet / 2);
        bin = rest + bin;
    }
    return bin;
}

function binaryToDecimal(bin) {
    let decimal = 0;
    let power = 7;
    for (let i = 0; i < 8; i++) {
        if (bin[i] === "1") decimal += Math.pow(2, power);
        power--;
    }
    return decimal;
}

/**
 * firstOctet can be int or string between 0 & 255
 */
function getClassOfIp(firstOctet) {
    // console.log(firstOctet);
    firstOctet = parseInt(firstOctet);
    if (!octetRangeIsValid(firstOctet)) console.error("invalide first octet");

    if (firstOctet >= 0 && firstOctet <= 127) return "class A";
    if (firstOctet >= 128 && firstOctet <= 191) return "class B";
    if (firstOctet >= 192 && firstOctet <= 223) return "class C";
    if (firstOctet >= 224 && firstOctet <= 239) return "class D";
    if (firstOctet >= 240 && firstOctet <= 255) return "class E";
}

/**
 * need to include prefixe
 * @param {*} info
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
 * @param {*} prefixedNeighbors
 */
function upperPrefixNeighboringSubnetsTableGen(prefixedNeighbors) {
    // empty in case the user inputed an address with 8,16,24 prefix!
    if (prefixedNeighbors.length === 0) throw "Input is empty";

    prefixedNeighbors.reverse();
    // largest list is the one with with smallest prefix
    const largestSubnetsList = prefixedNeighbors[0].subnets;

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

    largestSubnetsList.forEach((subnet) => {
        table += "<tr>";

        for (let i = 0; i < SubnetListsIterators.length; i++) {
            const currentSubnetsList = prefixedNeighbors[i].subnets;
            if (subnet === currentSubnetsList[SubnetListsIterators[i]]) {
                table += `<td>${subnet}</td>`;
                SubnetListsIterators[i]++;
            } else table += "<td></td>";
        }
        table += "</tr>";
    });
    table += "</table>";

    // console.log(table);
    return table;
}
