import Calculadora from "./Calculadora"
import Chico from "./Chico"
import EPI from "./EPI"
import FolhaDeSaida from "./FolhaDeSaida"
import Gaveteiro from "./Gaveteiro"
import PortaCartoes from "./PortaCartoes"
import HVMState from "../state/HVMState"
import { sleep } from "../utils/sleep"
import DrawerLanguage from "../syntax/language/DrawerLanguage"

export default class HVM {

    private state:HVMState = 'ENDED'

    public calculadora = new Calculadora()
    public chico = new Chico()
    public epi = new EPI()
    public folhaDeSaida = new FolhaDeSaida()
    public gaveteiro = new Gaveteiro()
    public portaCartoes = new PortaCartoes()

    private delay = 0

    public async run(code:string) {

        this.portaCartoes.inserir(...code.split(/\s+/))

        this.state = "RUNNING"

        await this.executable()

    }

    public async executable() {

        const syntax = new DrawerLanguage()

        await this.chico.carga(this.gaveteiro, this.portaCartoes, this.delay);     
        
        do {

            if (this.delay > 0 && this.state != "WAIT") {
             
                await sleep(this.delay)

            }

            const token = syntax.lexer(await this.chico.proximaInstrucao(this.gaveteiro, this.epi))

            const instrucao = token.getType()

            const EE = token.getValue()

            if (instrucao == "0EE")
                this.chico.cpEE(this.calculadora, this.gaveteiro, EE)

            else if (instrucao == "1EE")
                this.chico.cpAC(this.calculadora, this.gaveteiro, EE)

            else if (instrucao == "2EE")
                this.chico.some(this.calculadora, this.gaveteiro, EE)

            else if (instrucao == "3EE") 
                this.chico.subtraia(this.calculadora, this.gaveteiro, EE)

            else if (instrucao == "4EE") 
                this.chico.multiplique(this.calculadora, this.gaveteiro, EE)
                
            else if (instrucao == "5EE") 
                this.chico.divida(this.calculadora, this.gaveteiro, EE)

            else if (instrucao == "6EE")
                this.chico.se(this.calculadora, this.epi, EE)

            else if (instrucao == "7EE")
                await this.chico.leia(this.gaveteiro, this.portaCartoes, EE)

            else if (instrucao == "8EE")
                this.chico.escreva(this.gaveteiro, this.folhaDeSaida, EE)

            else if (instrucao == "9EE")
                this.chico.para(this.epi, EE)

            else if (instrucao == "0-N")
                this.chico.constante(this.calculadora, EE)

            else if(instrucao == "000") 
                this.state = this.chico.pare()

        } while(this.state != "ENDED");

    }

    public setDelay(ms:number) {

        this.delay = ms

    }

    public setState(state:HVMState) {

        this.state = state

    }

    public getState() {

        return this.state

    }

}