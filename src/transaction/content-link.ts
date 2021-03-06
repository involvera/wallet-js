import { Collection, Model } from 'acey'
import fetch from 'node-fetch';
import { ROOT_API_URL } from '../constant';
import { IOutput, IOutputRaw, Output } from './output';

export interface ITarget {
    tx_id: string
    vout: number
}

export interface ITargetRaw {
    tx_id: Buffer
    vout: number
}

export interface IKindLink {
    tx_id: string
    lh: number
    vout: number
    output: IOutput
    target: ITarget
}

export interface IKindLinkRaw {
    tx_id: Buffer
    lh: number
    vout: number
    output: IOutputRaw
    target: ITargetRaw
}

export interface IContentLink { 
    link: IKindLink
    pubkh_origin: string
}

export interface IContentLinkRaw { 
    link: IKindLinkRaw
    pubkh_origin: Buffer
}

export class Target extends Model {

    constructor(initialState: ITarget = {tx_id: '', vout: -1}, options: any){
        super(initialState, options)
    }
    
    isSet = () => this.get().txID() === '' || this.get().vout() === -1

    get = () => {
        return {
            txID: () => this.state.tx_id,
            vout: () => this.state.vout
        }
    }

    toRaw = (): ITargetRaw => {
        return {
            tx_id: !this.get().txID() ? Buffer.from([]) : Buffer.from(this.get().txID(), 'hex'),
            vout: this.get().vout()
        }
    }
}

export class ContentLink extends Model {

    static FetchThread = async (pubkhID: string) => {
        const response = await fetch(ROOT_API_URL + '/thread/' + pubkhID)
        if (response.status === 200){
            const json = await response.json()
            return new ContentLink(json, {})
        }
        throw new Error(await response.text())
    }

    static FetchProposal = async (pubkhID: string) => {
        const response = await fetch(ROOT_API_URL + '/proposal/' + pubkhID)
        if (response.status === 200){
            const json = await response.json()
            return new ContentLink(json, {})
        }
        throw new Error(await response.text())
    }

    constructor(initialState: IContentLink, options: any){
        super(initialState, options)
        this.setState({
            link: Object.assign(initialState.link, {
                output: new Output(initialState.link.output, this.kids()),
                target: new Target(initialState.link.target, this.kids())
            })
        })
    }

    get = () => {
        return {
            txID: (): string => this.state.link.tx_id,
            vout: (): number => this.state.link.vout,
            lh: (): number => this.state.link.lh,
            output: (): Output => this.state.link.output,
            target: (): Target => this.state.link.target,
            pubKHOrigin: (): string => this.state.pubkh_origin
        }
    }

    toRaw = (): IContentLinkRaw => {
        return {
            link: {
                tx_id: Buffer.from(this.get().txID(), 'hex'),
                vout: this.get().vout(),
                lh: this.get().lh(),
                output: this.get().output().toRaw().default(),
                target: this.get().target().toRaw()
            },
            pubkh_origin: Buffer.from(this.get().pubKHOrigin(), 'hex')
        }
    }
}

export class ContentLinkList extends Collection {
    constructor(initialState = [], options: any){
        super(initialState, [ContentLink, ContentLinkList], options)
    }
}