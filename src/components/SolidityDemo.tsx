'use client'

import { useState } from 'react'

interface SolidityDemoProps {
  onCodeLoad: (code: string) => void
}

const SolidityDemo: React.FC<SolidityDemoProps> = ({ onCodeLoad }) => {
  const [activeButton, setActiveButton] = useState<number | null>(null)
  
  const demoCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SimpleStorage
 * @dev Store & retrieve value in a variable
 */
contract SimpleStorage {
    
    uint256 private storedData;
    address public owner;
    bool public isActive = true;
    
    mapping(address => uint256) public balances;
    
    event DataStored(uint256 indexed value, address indexed sender);
    event OwnerChanged(address indexed oldOwner, address indexed newOwner);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    modifier isActiveContract() {
        require(isActive, "Contract is not active");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        storedData = 0;
    }
    
    function store(uint256 x) public onlyOwner isActiveContract {
        require(x > 0, "Value must be positive");
        storedData = x;
        balances[msg.sender] += x;
        emit DataStored(x, msg.sender);
    }
    
    function retrieve() public view returns (uint256) {
        return storedData;
    }
    
    function getBalance() external view returns (uint256) {
        return balances[msg.sender];
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnerChanged(oldOwner, newOwner);
    }
    
    function toggleActive() external onlyOwner {
        isActive = !isActive;
    }
    
    // Функция для получения информации о блоке
    function getBlockInfo() external view returns (
        uint256 blockNumber,
        uint256 blockTimestamp,
        address blockCoinbase
    ) {
        return (block.number, block.timestamp, block.coinbase);
    }
    
    // Fallback функция
    fallback() external payable {
        revert("Function not found");
    }
    
    receive() external payable {
        // Получение ETH
    }
}`

  const quickExamples = [
    {
      name: 'Простой контракт',
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract HelloWorld {
    string public message = "Hello, Blockchain!";
    
    function setMessage(string memory newMessage) public {
        message = newMessage;
    }
}`
    },
    {
      name: 'ERC20 Token',
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleToken {
    string public name = "MyToken";
    string public symbol = "MTK";
    uint8 public decimals = 18;
    uint256 public totalSupply = 1000000 * 10**18;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor() {
        balanceOf[msg.sender] = totalSupply;
    }
    
    function transfer(address to, uint256 value) public returns (bool) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }
}`
    },
    {
      name: 'Голосование',
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Voting {
    struct Proposal {
        string description;
        uint256 voteCount;
        bool executed;
    }
    
    address public chairperson;
    mapping(address => bool) public voters;
    mapping(address => bool) public hasVoted;
    Proposal[] public proposals;
    
    modifier onlyChairperson() {
        require(msg.sender == chairperson, "Only chairperson can call this");
        _;
    }
    
    constructor() {
        chairperson = msg.sender;
        voters[msg.sender] = true;
    }
    
    function addVoter(address voter) external onlyChairperson {
        voters[voter] = true;
    }
    
    function addProposal(string memory description) external onlyChairperson {
        proposals.push(Proposal({
            description: description,
            voteCount: 0,
            executed: false
        }));
    }
    
    function vote(uint256 proposalIndex) external {
        require(voters[msg.sender], "Not authorized to vote");
        require(!hasVoted[msg.sender], "Already voted");
        require(proposalIndex < proposals.length, "Invalid proposal");
        
        hasVoted[msg.sender] = true;
        proposals[proposalIndex].voteCount++;
    }
}`
    }
  ]

  // Расширенные примеры
  const extraExamples = [
    {
      name: 'Мини-NFT (ERC721-lite)',
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MiniERC721 {
    string public name = "MiniNFT";
    string public symbol = "MNFT";
    address public owner;

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;

    modifier onlyOwner() { require(msg.sender == owner, "not owner"); _; }

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    constructor() { owner = msg.sender; }

    function balanceOf(address account) public view returns (uint256) {
        require(account != address(0), "zero");
        return _balances[account];
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address o = _owners[tokenId];
        require(o != address(0), "not minted");
        return o;
    }

    function _mint(address to, uint256 tokenId) internal {
        require(to != address(0), "zero");
        require(_owners[tokenId] == address(0), "exists");
        _owners[tokenId] = to;
        _balances[to] += 1;
        emit Transfer(address(0), to, tokenId);
    }

    function mint(address to, uint256 tokenId) external onlyOwner {
        _mint(to, tokenId);
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        require(ownerOf(tokenId) == from, "not owner");
        require(to != address(0), "zero");
        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;
        emit Transfer(from, to, tokenId);
    }
}`
    },
    {
      name: 'Escrow (эскроу)',
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Escrow {
    address public payer;
    address public payee;
    address public arbiter;
    uint256 public amount;
    bool public funded;
    bool public released;

    constructor(address _payee, address _arbiter) payable {
        payer = msg.sender;
        payee = _payee;
        arbiter = _arbiter;
        amount = msg.value;
        funded = msg.value > 0;
    }

    function fund() external payable {
        require(msg.sender == payer, "only payer");
        require(!funded, "already funded");
        amount = msg.value;
        funded = true;
    }

    function release() external {
        require(msg.sender == arbiter, "only arbiter");
        require(funded && !released, "bad state");
        released = true;
        (bool ok, ) = payee.call{value: amount}("");
        require(ok, "transfer fail");
    }
}`
    },
    {
      name: 'Pausable (пауза контракта)',
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Pausable {
    bool public paused;
    address public owner;

    modifier onlyOwner(){ require(msg.sender==owner, "not owner"); _; }
    modifier whenNotPaused(){ require(!paused, "paused"); _; }

    constructor(){ owner = msg.sender; }
    function pause() external onlyOwner { paused = true; }
    function unpause() external onlyOwner { paused = false; }
}

contract Vault is Pausable {
    mapping(address => uint256) public balances;
    function deposit() external payable whenNotPaused { balances[msg.sender]+=msg.value; }
    function withdraw(uint256 amount) external whenNotPaused {
        require(balances[msg.sender]>=amount, "insufficient");
        balances[msg.sender]-=amount;
        (bool ok,) = msg.sender.call{value:amount}("");
        require(ok, "fail");
    }
}`
    },
    {
      name: 'TimeLock (время блокировки)',
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TimeLockWallet {
    address public owner;
    uint256 public releaseTime;

    constructor(uint256 delaySeconds){
        owner = msg.sender;
        releaseTime = block.timestamp + delaySeconds;
    }

    receive() external payable {}

    function withdraw() external {
        require(msg.sender==owner, "not owner");
        require(block.timestamp >= releaseTime, "locked");
        (bool ok,) = owner.call{value: address(this).balance}("");
        require(ok, "fail");
    }
}`
    },
    {
      name: 'SimpleDAO (простая организация)',
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleDAO {
    struct Proposal { string desc; uint256 yes; uint256 no; bool executed; }
    address public chair;
    mapping(address => bool) public member;
    mapping(address => bool) public voted;
    Proposal[] public proposals;

    modifier onlyChair(){ require(msg.sender==chair, "not chair"); _; }
    modifier onlyMember(){ require(member[msg.sender], "not member"); _; }

    constructor(){ chair = msg.sender; member[msg.sender]=true; }
    function addMember(address m) external onlyChair { member[m]=true; }
    function create(string calldata desc) external onlyMember { proposals.push(Proposal(desc,0,0,false)); }
    function vote(uint256 id, bool support) external onlyMember {
        require(!voted[msg.sender], "voted");
        require(id < proposals.length, "bad id");
        voted[msg.sender] = true;
        if (support) proposals[id].yes++; else proposals[id].no++;
    }
    function execute(uint256 id) external onlyChair {
        Proposal storage p = proposals[id];
        require(!p.executed, "done"); p.executed = true; // эффект
    }
}`
    },
  ]

  return (
    <div className="p-4 bg-slate-800 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">
        🚀 Примеры кода Solidity для CodeMirror
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {quickExamples.concat(extraExamples).map((example, index) => (
          <button
            key={index}
            onClick={() => {
              onCodeLoad(example.code)
              setActiveButton(index)
            }}
            className={`p-3 rounded-lg text-left transition-all transform hover:scale-105 ${
              activeButton === index
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            <div className="font-medium text-white text-sm">{example.name}</div>
            <div className={`text-xs mt-1 ${
              activeButton === index ? 'text-purple-200' : 'text-gray-400'
            }`}>
              {example.code.split('\n').length} строк
            </div>
          </button>
        ))}
        
        <button
          onClick={() => {
            onCodeLoad(demoCode)
            setActiveButton(-1) // Специальный индекс для полного примера
          }}
          className={`p-3 rounded-lg text-left transition-all transform hover:scale-105 ${
            activeButton === -1
              ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
              : 'bg-slate-700 hover:bg-slate-600'
          }`}
        >
          <div className="font-medium text-white text-sm">🚀 Полный пример</div>
          <div className={`text-xs mt-1 ${
            activeButton === -1 ? 'text-purple-200' : 'text-gray-400'
          }`}>
            Все возможности Solidity
          </div>
        </button>
      </div>
      
      <div className="text-xs text-gray-400 space-y-1">
        <div className="flex items-center gap-2">
          <span>⚡</span>
          <span>CodeMirror 6 с профессиональной подсветкой синтаксиса</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🔮</span>
          <span>Автодополнение: contract, function, uint256, msg.sender...</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🎨</span>
          <span>Скобки, отступы, fold/unfold блоков</span>
        </div>
      </div>
    </div>
  )
}

export default SolidityDemo 