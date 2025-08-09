import { type NextRequest, NextResponse } from "next/server"

interface ObfuscationOptions {
  stringEncryption: boolean
  variableRenaming: boolean
  controlFlowObfuscation: boolean
  deadCodeInjection: boolean
  numberEncoding: boolean
  functionWrapping: boolean
  vmObfuscation: boolean
  antiDebug: boolean
  constantFolding: boolean
  instructionSubstitution: boolean
  obfuscationLevel: number
}

class AdvancedLuauObfuscator {
  private variableMap: Map<string, string> = new Map()
  private functionMap: Map<string, string> = new Map()
  private stringMap: Map<string, string> = new Map()
  private options: ObfuscationOptions
  private vmInstructions: string[] = []
  private encryptionKeys: number[] = []

  constructor(options: ObfuscationOptions) {
    this.options = options
    this.generateEncryptionKeys()
  }

  private generateEncryptionKeys(): void {
    for (let i = 0; i < 10; i++) {
      this.encryptionKeys.push(Math.floor(Math.random() * 255) + 1)
    }
  }

  private generateCleanName(type: "var" | "func" | "temp" = "var"): string {
    const prefixes = {
      var: ["l", "v", "x", "y", "z", "a", "b", "c", "d", "e"],
      func: ["f", "g", "h", "fn", "fx", "gx", "hx"],
      temp: ["t", "u", "w", "tmp", "val", "res", "ret"],
    }

    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    const prefixList = prefixes[type]
    const prefix = prefixList[Math.floor(Math.random() * prefixList.length)]
    const length = Math.floor(Math.random() * 8) + 4

    let result = prefix
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  private encryptStringAdvanced(str: string): string {
    if (!this.options.stringEncryption) return `"${str}"`

    const layers = Math.min(this.options.obfuscationLevel, 5)
    let encrypted = str
    const keys = []

    for (let layer = 0; layer < layers; layer++) {
      const key = this.encryptionKeys[layer % this.encryptionKeys.length]
      keys.push(key)
      let layerEncrypted = ""
      for (let i = 0; i < encrypted.length; i++) {
        layerEncrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ key ^ (i % 256))
      }
      encrypted = layerEncrypted
    }

    const dataVar = this.generateCleanName("temp")
    const keysVar = this.generateCleanName("temp")
    const resultVar = this.generateCleanName("temp")
    const indexVar = this.generateCleanName("temp")

    let byteArray = "{"
    for (let i = 0; i < encrypted.length; i++) {
      byteArray += encrypted.charCodeAt(i).toString()
      if (i < encrypted.length - 1) byteArray += ","
    }
    byteArray += "}"

    return `(function()
local ${keysVar}={${keys.join(",")}}
local ${dataVar}=${byteArray}
local ${resultVar}={}
for ${indexVar}=1,#${dataVar} do
local byte=${dataVar}[${indexVar}]
for layer=#${keysVar},1,-1 do
byte=byte~${keysVar}[layer]~((${indexVar}-1)%256)
end
${resultVar}[${indexVar}]=string.char(byte)
end
return table.concat(${resultVar})
end)()`
  }

  private createVirtualMachine(code: string): string {
    if (!this.options.vmObfuscation) return code

    const vmVar = this.generateCleanName("func")
    const instructionsVar = this.generateCleanName("var")
    const stackVar = this.generateCleanName("var")
    const pcVar = this.generateCleanName("var")
    const opcodeVar = this.generateCleanName("var")

    const instructions = this.codeToInstructions(code)

    return `local ${vmVar}=function()
local ${instructionsVar}=${JSON.stringify(instructions)}
local ${stackVar}={}
local ${pcVar}=1
while ${pcVar}<=#${instructionsVar} do
local ${opcodeVar}=${instructionsVar}[${pcVar}]
if ${opcodeVar}.op=="LOAD" then
table.insert(${stackVar},${opcodeVar}.value)
elseif ${opcodeVar}.op=="CALL" then
local func=table.remove(${stackVar})
local args={}
for i=1,${opcodeVar}.argc do
table.insert(args,1,table.remove(${stackVar}))
end
local result=func(unpack(args))
if result~=nil then
table.insert(${stackVar},result)
end
elseif ${opcodeVar}.op=="EXEC" then
local code=table.remove(${stackVar})
loadstring(code)()
end
${pcVar}=${pcVar}+1
end
end
${vmVar}()`
  }

  private codeToInstructions(code: string): any[] {
    return [
      { op: "LOAD", value: `loadstring("${code.replace(/"/g, '\\"')}")` },
      { op: "CALL", argc: 0 },
    ]
  }

  private obfuscateControlFlowAdvanced(code: string): string {
    if (!this.options.controlFlowObfuscation) return code

    const predicateVar1 = this.generateCleanName("var")
    const predicateVar2 = this.generateCleanName("var")
    const predicateVar3 = this.generateCleanName("func")

    let obfuscated = `local ${predicateVar1}=math.random(1,1000)
local ${predicateVar2}=${predicateVar1}*2
local ${predicateVar3}=function(x)return(x*x-x*x)==0 end
${code}`

    obfuscated = obfuscated.replace(/if\s+(.+?)\s+then/g, (match, condition) => {
      const checkVar1 = this.generateCleanName("temp")
      const checkVar2 = this.generateCleanName("temp")
      const condVar = this.generateCleanName("temp")

      return `local ${checkVar1}=${predicateVar3}(${predicateVar1})
local ${checkVar2}=${predicateVar2}/2==${predicateVar1}
local ${condVar}=(${condition})
if ${checkVar1} and ${checkVar2} and ${condVar} then`
    })

    return obfuscated
  }

  private substituteInstructions(code: string): string {
    if (!this.options.instructionSubstitution) return code

    const substitutions = [
      [
        /\+/g,
        () => {
          const temp1 = this.generateCleanName("temp")
          const temp2 = this.generateCleanName("temp")
          return `+(function()local ${temp1},${temp2}=0,0;return ${temp1}+${temp2} end)()+`
        },
      ],
      [
        /-/g,
        () => {
          const temp = this.generateCleanName("temp")
          return `-(function()local ${temp}=0;return ${temp} end)()-`
        },
      ],
      [
        /\*/g,
        () => {
          const temp = this.generateCleanName("temp")
          return `*(function()local ${temp}=1;return ${temp} end)()*`
        },
      ],
    ]

    let result = code
    substitutions.forEach(([pattern, replacement]) => {
      if (typeof replacement === "function") {
        result = result.replace(pattern as RegExp, replacement)
      }
    })

    return result
  }

  private encodeNumberAdvanced(num: string): string {
    if (!this.options.numberEncoding) return num

    const value = Number.parseFloat(num)
    if (isNaN(value)) return num

    const complexity = Math.min(this.options.obfuscationLevel, 8)
    const operations = [
      () => `(${value + Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 100)})`,
      () => `(${value * 2}/2)`,
      () => `(${value}+${Math.floor(Math.random() * 50)}-${Math.floor(Math.random() * 50)})`,
      () => `math.floor(${value + Math.random()})`,
      () => `(${value}*${Math.random() + 1}/${Math.random() + 1})`,
      () => `(function()return ${value} end)()`,
      () => `(${value}^1)`,
      () => `(${value}|0)`,
    ]

    let result = value.toString()
    for (let i = 0; i < complexity; i++) {
      const op = operations[Math.floor(Math.random() * operations.length)]
      result = op().replace(value.toString(), result)
    }

    return result
  }

  private obfuscateConstants(code: string): string {
    if (!this.options.constantFolding) return code

    return code.replace(/\b(\d+)\b/g, (match, num) => {
      const val = Number.parseInt(num)
      const operations = [`(${val + 1}-1)`, `(${val * 2}/2)`, `(${val}+0)`, `math.floor(${val + 0.1})`, `(${val}*1)`]
      return operations[Math.floor(Math.random() * operations.length)]
    })
  }

  private addAntiDebugProtection(): string {
    if (!this.options.antiDebug) return ""

    const checkVar1 = this.generateCleanName("func")
    const checkVar2 = this.generateCleanName("func")
    const checkVar3 = this.generateCleanName("func")
    const timerVar = this.generateCleanName("var")
    const counterVar = this.generateCleanName("var")

    return `local ${timerVar}=tick()
local ${counterVar}=0
local ${checkVar1}=function()
local start=tick()
for i=1,1000 do
${counterVar}=${counterVar}+1
end
return tick()-start<0.1
end
local ${checkVar2}=function()
local env=getfenv()
return type(env)=="table" and #tostring(env)<100
end
local ${checkVar3}=function()
return tick()-${timerVar}<60
end
if not(${checkVar1}() and ${checkVar2}() and ${checkVar3}())then
while true do
wait(math.huge)
end
end
local ${this.generateCleanName("var")}=setmetatable({},{
__index=function()return function()end end,
__newindex=function()error("Access denied")end
})`
  }

  private generateAdvancedDeadCode(): string {
    const complexity = Math.min(this.options.obfuscationLevel, 6)
    const deadCodes = []

    for (let i = 0; i < complexity; i++) {
      const varName = this.generateCleanName("temp")
      const funcName = this.generateCleanName("func")

      const codes = [
        `local ${varName}=(function()return ${Math.floor(Math.random() * 1000)} end)()`,
        `local ${funcName}=function()return math.random()*tick()end`,
        `local ${varName}=string.rep("${this.generateCleanName()}",math.random(1,5))`,
        `if false then local ${varName}=${Math.random()}end`,
        `local ${varName}=setmetatable({},{__index=function()return ${Math.random()}end})`,
        `coroutine.create(function()return ${Math.random()}end)`,
      ]

      deadCodes.push(codes[Math.floor(Math.random() * codes.length)])
    }

    return deadCodes.join("\n")
  }

  public obfuscate(code: string): string {
    let obfuscatedCode = code

    if (this.options.variableRenaming) {
      const localVarRegex = /local\s+([a-zA-Z_][a-zA-Z0-9_]*)/g
      let match
      const robloxServices = [
        "game",
        "workspace",
        "script",
        "Players",
        "RunService",
        "UserInputService",
        "TweenService",
        "ReplicatedStorage",
        "ServerStorage",
        "StarterGui",
        "StarterPlayer",
        "HttpService",
        "DataStoreService",
        "MarketplaceService",
        "SoundService",
        "Lighting",
      ]

      while ((match = localVarRegex.exec(code)) !== null) {
        const originalName = match[1]
        if (!robloxServices.includes(originalName) && !this.variableMap.has(originalName)) {
          this.variableMap.set(originalName, this.generateCleanName("var"))
        }
      }

      this.variableMap.forEach((newName, originalName) => {
        const regex = new RegExp(`\\b${originalName}\\b`, "g")
        obfuscatedCode = obfuscatedCode.replace(regex, newName)
      })
    }

    if (this.options.stringEncryption) {
      obfuscatedCode = obfuscatedCode.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (match, str) => {
        return this.encryptStringAdvanced(str)
      })
      obfuscatedCode = obfuscatedCode.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, (match, str) => {
        return this.encryptStringAdvanced(str)
      })
    }

    if (this.options.numberEncoding) {
      obfuscatedCode = obfuscatedCode.replace(/\b\d+\.?\d*\b/g, (match) => {
        return this.encodeNumberAdvanced(match)
      })
    }

    obfuscatedCode = this.obfuscateConstants(obfuscatedCode)
    obfuscatedCode = this.substituteInstructions(obfuscatedCode)
    obfuscatedCode = this.obfuscateControlFlowAdvanced(obfuscatedCode)

    if (this.options.deadCodeInjection) {
      const lines = obfuscatedCode.split("\n")
      const newLines = []

      for (let i = 0; i < lines.length; i++) {
        newLines.push(lines[i])
        if (Math.random() < 0.3) {
          newLines.push(this.generateAdvancedDeadCode())
        }
      }

      obfuscatedCode = newLines.join("\n")
    }

    if (this.options.vmObfuscation && this.options.obfuscationLevel >= 8) {
      obfuscatedCode = this.createVirtualMachine(obfuscatedCode)
    }

    if (this.options.functionWrapping) {
      const layers = Math.min(Math.floor(this.options.obfuscationLevel / 2), 4)
      for (let i = 0; i < layers; i++) {
        const wrapperName = this.generateCleanName("func")
        const keyVar = this.generateCleanName("var")
        const checkVar = this.generateCleanName("var")
        const key = Math.floor(Math.random() * 10000) + 1000

        obfuscatedCode = `local ${keyVar}=${key}
local ${wrapperName}=function()
local ${checkVar}=${keyVar}
if ${checkVar}~=${key} or type(${checkVar})~="number" then 
error("Security violation detected")
end
${obfuscatedCode}
end
${wrapperName}()`
      }
    }

    const antiDebugCode = this.addAntiDebugProtection()
    const complexityCode = this.generateComplexityLayer()

    return antiDebugCode + "\n" + complexityCode + "\n" + obfuscatedCode
  }

  private generateComplexityLayer(): string {
    const complexity = Math.min(this.options.obfuscationLevel, 10)
    let layer = ""

    for (let i = 0; i < complexity; i++) {
      const varName = this.generateCleanName("var")
      const funcName = this.generateCleanName("func")

      layer += `local ${varName}=${Math.floor(Math.random() * 1000)}
local ${funcName}=function(x)
return(x and x*${Math.random()} or ${Math.random()})+${Math.random()}
end`
    }

    return layer
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code, options } = await request.json()

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Invalid Luau code" }, { status: 400 })
    }

    if (code.length > 100000) {
      return NextResponse.json({ error: "Code too large (max 100KB)" }, { status: 400 })
    }

    const obfuscator = new AdvancedLuauObfuscator(options)
    const obfuscatedCode = obfuscator.obfuscate(code)

    return NextResponse.json({
      obfuscatedCode,
      originalSize: code.length,
      obfuscatedSize: obfuscatedCode.length,
      compressionRatio: ((obfuscatedCode.length / code.length) * 100).toFixed(2),
      securityLevel: calculateSecurityLevel(options),
    })
  } catch (error) {
    console.error("Obfuscation error:", error)
    return NextResponse.json({ error: "Error during obfuscation process" }, { status: 500 })
  }
}

function calculateSecurityLevel(options: ObfuscationOptions): string {
  let score = 0

  if (options.stringEncryption) score += 15
  if (options.variableRenaming) score += 10
  if (options.controlFlowObfuscation) score += 20
  if (options.deadCodeInjection) score += 10
  if (options.numberEncoding) score += 10
  if (options.functionWrapping) score += 15
  if (options.vmObfuscation) score += 25
  if (options.antiDebug) score += 20
  if (options.constantFolding) score += 10
  if (options.instructionSubstitution) score += 15

  score += options.obfuscationLevel * 2

  if (score >= 90) return "Military Grade"
  if (score >= 70) return "Enterprise"
  if (score >= 50) return "Professional"
  if (score >= 30) return "Standard"
  return "Basic"
}
