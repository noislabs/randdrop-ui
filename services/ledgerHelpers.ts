import { HdPath, Slip10RawIndex } from "@cosmjs/crypto";

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Paths  |  makeCosmosPath (118) and makeEthereumPath (60, Injective)
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/**
 * The Cosmos Hub derivation path in the form `m/44'/118'/0'/0/a`
 * with 0-based account index `a`.
 */
export function makeCosmosPath(a: number): HdPath {
  return [
    // purpose'
    Slip10RawIndex.hardened(44),
    // coin_type'
    Slip10RawIndex.hardened(118),
    // account'
    Slip10RawIndex.hardened(0),
    // change
    Slip10RawIndex.normal(0),
    // address_index
    Slip10RawIndex.normal(a),
  ];
}

/**
 * Ethereum Path for Inejctive in the form `m/44'/60'/0'/0/a'
 * with 0 based account idx
 * 44' = purpose, Injective uses SLIP44 so it's still 44'
 * 60' = coin_type 
 * 0' = assumes account 0
 * 0 = receiving address (1 is change address)
 */
export function makeEthereumPath(a: number): HdPath {
  return [
    // purpose'
    Slip10RawIndex.hardened(44),
    // coin_type'
    Slip10RawIndex.hardened(60),
    // account'
    Slip10RawIndex.hardened(0),
    // change
    Slip10RawIndex.normal(0),
    // address_index
    Slip10RawIndex.normal(a),
  ];
}