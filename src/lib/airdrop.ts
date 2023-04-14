import sha256 from 'crypto-js/sha256';
import {MerkleTree} from 'merkletreejs'

class Airdrop {
  private tree: MerkleTree;

  constructor(accounts: Array<{ address: string; amount: string }>) {
    const leaves = accounts.map(a => sha256(a.address + a.amount))
    this.tree = new MerkleTree(leaves, sha256, {sort: true})
  }

  public getMerkleRoot(): string {
    return this.tree.getHexRoot().replace('0x', '')
  }

  public getMerkleProof(account: {
    address: string;
    amount: string;
  }): string[] {
    return this.tree
    .getHexProof(sha256(account.address + account.amount).toString())
    .map(v => v.replace('0x', ''))
  }

  public verify(
    proof: string[],
    account: { address: string; amount: string }
  ): boolean {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // let hashBuf = Buffer.from(sha256(account.address + account.amount).toString())
    let hashBuf = encoder.encode(sha256(account.address + account.amount).toString())

    proof.forEach(proofElem => {
      const proofBuf = new Uint8Array(Uint8Array.from(proofElem, c => parseInt(c, 16)));
      const newBuf = new Uint8Array(hashBuf.byteLength + proofBuf.byteLength);
      newBuf.set(hashBuf, 0);
      newBuf.set(proofBuf, hashBuf.byteLength);
      hashBuf = encoder.encode(sha256(newBuf).toString());
    });
    
    return this.getMerkleRoot() === decoder.decode(hashBuf);

    // proof.forEach(proofElem => {
    //   const proofBuf = new Uint8Array(Uint8Array.from(proofElem, c => parseInt(c, 16)));
    //   if (hashBuf.byteLength < proofBuf.length) {
    //     hashBuf = encoder.encode(sha256(Buffer.concat([hashBuf, proofBuf])).toString());
    //   } else {
    //     hashBuf = encoder.encode(sha256(Buffer.concat([proofBuf, hashBuf])).toString());
    //   }
    // });
    
    // return this.getMerkleRoot() === decoder.decode(hashBuf);

    // proof.forEach(proofElem => {
    //   //const proofBuf = Buffer.from(proofElem, 'hex')
    //   //const proofBuf = decoder.decode(new Uint8Array(Buffer.from(proofElem, 'hex')));
    //   const proofBuf = decoder.decode(new Uint8Array(Uint8Array.from(proofElem, c => parseInt(c, 16))));
    //   if (hashBuf.byteLength < proofBuf.length) {
    //     //hashBuf = Buffer.from(sha256(Buffer.concat([hashBuf, proofBuf]).toString()))
    //     hashBuf = encoder.encode(sha256(Buffer.concat([hashBuf, proofBuf])).toString());
    //   } else {
    //     hashBuf = Buffer.from(sha256(Buffer.concat([proofBuf, hashBuf]).toString()))
    //   }
    // })

    // return this.getMerkleRoot() === hashBuf.toString('hex')
  }
}

export {Airdrop}