"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Copy, Download, Shield, Code, Upload, Cpu, Eye, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

export default function AdvancedLuauObfuscator() {
  const [inputCode, setInputCode] = useState("")
  const [outputCode, setOutputCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState("")
  const [securityLevel, setSecurityLevel] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [options, setOptions] = useState<ObfuscationOptions>({
    stringEncryption: true,
    variableRenaming: true,
    controlFlowObfuscation: true,
    deadCodeInjection: true,
    numberEncoding: true,
    functionWrapping: true,
    vmObfuscation: false,
    antiDebug: true,
    constantFolding: true,
    instructionSubstitution: true,
    obfuscationLevel: 7,
  })
  const { toast } = useToast()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validExtensions = [".lua", ".luau", ".txt"]
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))

    if (!validExtensions.includes(fileExtension)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a .lua, .luau, or .txt file",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setInputCode(content)
      setFileName(file.name)
      toast({
        title: "File Uploaded",
        description: `Successfully loaded ${file.name}`,
      })
    }
    reader.onerror = () => {
      toast({
        title: "Upload Error",
        description: "Failed to read the file",
        variant: "destructive",
      })
    }
    reader.readAsText(file)
  }

  const handleObfuscate = async () => {
    if (!inputCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter Luau code to obfuscate",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/obfuscate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: inputCode,
          options,
        }),
      })

      if (!response.ok) {
        throw new Error("Obfuscation failed")
      }

      const data = await response.json()
      setOutputCode(data.obfuscatedCode)
      setSecurityLevel(data.securityLevel)

      toast({
        title: "Success",
        description: `Code obfuscated successfully! Security Level: ${data.securityLevel}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during obfuscation",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied",
        description: "Code copied to clipboard",
      })
    } catch (error) {
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      textArea.style.top = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      try {
        document.execCommand("copy")
        toast({
          title: "Copied",
          description: "Code copied to clipboard",
        })
      } catch (err) {
        toast({
          title: "Copy Failed",
          description: "Unable to copy code",
          variant: "destructive",
        })
      }

      document.body.removeChild(textArea)
    }
  }

  const downloadCode = () => {
    const blob = new Blob([outputCode], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName ? `obfuscated_${fileName}` : "obfuscated_script.lua"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const clearCode = () => {
    setInputCode("")
    setOutputCode("")
    setFileName("")
    setSecurityLevel("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getSecurityColor = (level: string) => {
    switch (level) {
      case "Devil":
        return "bg-red-600"
      case "Higher":
        return "bg-orange-600"
      case "High":
        return "bg-yellow-600"
      case "Standard":
        return "bg-blue-600"
      default:
        return "bg-gray-600"
    }
  }

  const calculateSecurityScore = () => {
    let score = 0
    if (options.stringEncryption) score += 10
    if (options.variableRenaming) score += 8
    if (options.controlFlowObfuscation) score += 15
    if (options.deadCodeInjection) score += 8
    if (options.numberEncoding) score += 8
    if (options.functionWrapping) score += 12
    if (options.vmObfuscation) score += 20
    if (options.antiDebug) score += 15
    if (options.constantFolding) score += 8
    if (options.instructionSubstitution) score += 12
    score += options.obfuscationLevel * 2
    return Math.min(score, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Luau Obfuscator</h1>
          </div>
          <p className="text-slate-300 text-lg">Luau code obfuscation made by Xzerne</p>
          <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
            <Badge variant="secondary" className="bg-red-600 text-white">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Devil Protection
            </Badge>
            <Badge variant="secondary" className="bg-purple-600 text-white">
              <Cpu className="w-3 h-3 mr-1" />
              VM Protection
            </Badge>
            <Badge variant="secondary" className="bg-green-600 text-white">
              <Eye className="w-3 h-3 mr-1" />
              Anti-Debug
            </Badge>
            <Badge variant="secondary" className="bg-blue-600 text-white">
              <Code className="w-3 h-3 mr-1" />
             For Roblox
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Security Settings</CardTitle>
              <CardDescription className="text-slate-300">Configure obfuscation parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-white">Security Score</Label>
                  <span className="text-white font-bold">{calculateSecurityScore()}%</span>
                </div>
                <Progress value={calculateSecurityScore()} className="w-full" />
                {securityLevel && (
                  <Badge className={`${getSecurityColor(securityLevel)} text-white`}>{securityLevel}</Badge>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="string-encryption" className="text-white text-sm">
                    String Encryption
                  </Label>
                  <Switch
                    id="string-encryption"
                    checked={options.stringEncryption}
                    onCheckedChange={(checked) => setOptions({ ...options, stringEncryption: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="variable-renaming" className="text-white text-sm">
                    Variable Renaming
                  </Label>
                  <Switch
                    id="variable-renaming"
                    checked={options.variableRenaming}
                    onCheckedChange={(checked) => setOptions({ ...options, variableRenaming: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="control-flow" className="text-white text-sm">
                    Control Flow Obfuscation
                  </Label>
                  <Switch
                    id="control-flow"
                    checked={options.controlFlowObfuscation}
                    onCheckedChange={(checked) => setOptions({ ...options, controlFlowObfuscation: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="vm-obfuscation" className="text-white text-sm">
                    Virtual Machine Protection
                  </Label>
                  <Switch
                    id="vm-obfuscation"
                    checked={options.vmObfuscation}
                    onCheckedChange={(checked) => setOptions({ ...options, vmObfuscation: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="anti-debug" className="text-white text-sm">
                    Anti-Debug Protection
                  </Label>
                  <Switch
                    id="anti-debug"
                    checked={options.antiDebug}
                    onCheckedChange={(checked) => setOptions({ ...options, antiDebug: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="instruction-substitution" className="text-white text-sm">
                    Instruction Substitution
                  </Label>
                  <Switch
                    id="instruction-substitution"
                    checked={options.instructionSubstitution}
                    onCheckedChange={(checked) => setOptions({ ...options, instructionSubstitution: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="constant-folding" className="text-white text-sm">
                    Constant Folding
                  </Label>
                  <Switch
                    id="constant-folding"
                    checked={options.constantFolding}
                    onCheckedChange={(checked) => setOptions({ ...options, constantFolding: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="dead-code" className="text-white text-sm">
                    Dead Code Injection
                  </Label>
                  <Switch
                    id="dead-code"
                    checked={options.deadCodeInjection}
                    onCheckedChange={(checked) => setOptions({ ...options, deadCodeInjection: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="number-encoding" className="text-white text-sm">
                    Number Encoding
                  </Label>
                  <Switch
                    id="number-encoding"
                    checked={options.numberEncoding}
                    onCheckedChange={(checked) => setOptions({ ...options, numberEncoding: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="function-wrapping" className="text-white text-sm">
                    Function Wrapping
                  </Label>
                  <Switch
                    id="function-wrapping"
                    checked={options.functionWrapping}
                    onCheckedChange={(checked) => setOptions({ ...options, functionWrapping: checked })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Obfuscation Level: {options.obfuscationLevel}/10</Label>
                <Slider
                  value={[options.obfuscationLevel]}
                  onValueChange={(value) => setOptions({ ...options, obfuscationLevel: value[0] })}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-slate-400">
                  {options.obfuscationLevel <= 3 && "Basic Protection"}
                  {options.obfuscationLevel > 3 && options.obfuscationLevel <= 6 && "Standard Protection"}
                  {options.obfuscationLevel > 6 && options.obfuscationLevel <= 8 && "Advanced Protection"}
                  {options.obfuscationLevel > 8 && "Devil Protection"}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <Tabs defaultValue="input" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                <TabsTrigger value="input" className="text-white">
                  Source Code
                </TabsTrigger>
                <TabsTrigger value="output" className="text-white">
                  Obfuscated Code
                </TabsTrigger>
              </TabsList>

              <TabsContent value="input" className="space-y-4">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Input Luau Code</CardTitle>
                    <CardDescription className="text-slate-300">
                      Upload a file or paste your Luau code here for obfuscation
                      {fileName && <span className="block mt-1 text-green-400">Current file: {fileName}</span>}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 p-4 border-2 border-dashed border-slate-600 rounded-lg">
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-300 mb-2">Upload Luau File</p>
                        <p className="text-slate-500 text-sm mb-3">Supports .lua, .luau, .txt files (max 5MB)</p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".lua,.luau,.txt"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <div className="flex gap-2 justify-center flex-wrap">
                          <Button
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                            className="border-slate-600 text-white hover:bg-slate-700"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose File
                          </Button>
                          {(inputCode || fileName) && (
                            <Button
                              onClick={clearCode}
                              variant="outline"
                              className="border-red-600 text-red-400 hover:bg-red-900/20 bg-transparent"
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <Textarea
                      placeholder="local Players = game:GetService('Players')
local RunService = game:GetService('RunService')
local HttpService = game:GetService('HttpService')

local player = Players.LocalPlayer
local secretKey = 'MySecretKey123'

local function encryptData(data)
    local encrypted = {}
    for i = 1, #data do
        encrypted[i] = string.char(string.byte(data, i) ~ 42)
    end
    return table.concat(encrypted)
end

local function validateUser()
    if player and player.Name then
        local hash = HttpService:GenerateGUID(false)
        print('User validated: ' .. player.Name .. ' - ' .. hash)
        return true
    end
    return false
end

if validateUser() then
    local connection
    connection = RunService.Heartbeat:Connect(function()
        local data = encryptData('Important game data')
    end)
end"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      className="min-h-[400px] bg-slate-900 border-slate-600 text-white font-mono text-sm"
                    />
                    <div className="flex gap-2 mt-4 flex-wrap">
                      <Button
                        onClick={handleObfuscate}
                        disabled={isLoading}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {isLoading ? "Obfuscating..." : "Obfuscate Code"}
                        <Shield className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="output" className="space-y-4">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Obfuscated Code</CardTitle>
                    <CardDescription className="text-slate-300">
                      Your Luau code has been obfuscated with advanced security
                      {securityLevel && (
                        <span className="block mt-1">
                          Security Level: <span className="text-green-400 font-semibold">{securityLevel}</span>
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={outputCode}
                      readOnly
                      className="min-h-[400px] bg-slate-900 border-slate-600 text-green-400 font-mono text-sm"
                      placeholder="Obfuscated code will appear here..."
                    />
                    <div className="flex gap-2 mt-4 flex-wrap">
                      <Button
                        onClick={() => copyToClipboard(outputCode)}
                        disabled={!outputCode}
                        variant="outline"
                        className="border-slate-600 text-white hover:bg-slate-700"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Code
                      </Button>
                      <Button
                        onClick={downloadCode}
                        disabled={!outputCode}
                        variant="outline"
                        className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mt-12">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
              <CardTitle className="text-white text-lg">Military Grade Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-sm">
                Advanced multi-layer obfuscation with VM protection and anti-reverse engineering measures
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Cpu className="w-8 h-8 text-purple-400 mb-2" />
              <CardTitle className="text-white text-lg">Virtual Machine</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-sm">
                Code runs in a virtual machine environment making it nearly impossible to analyze
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Eye className="w-8 h-8 text-green-400 mb-2" />
              <CardTitle className="text-white text-lg">Anti-Debug Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-sm">
                Advanced detection and prevention of debugging attempts and code analysis tools
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Code className="w-8 h-8 text-blue-400 mb-2" />
              <CardTitle className="text-white text-lg">Instant Obfuscate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-sm">
                Obfuscator is built-in to the web and can obfuscate at maximum speed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
