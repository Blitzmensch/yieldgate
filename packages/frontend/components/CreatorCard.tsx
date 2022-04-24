import { ContractAddresses } from '@artifacts/addresses'
import YieldGate from '@artifacts/contracts/YieldGate.sol/YieldGate.json'
import {
  Button,
  Flex,
  Heading,
  HStack,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { Confetti } from '@components/Confetti'
import { Creator } from '@entities/Creator.entity'
import { env } from '@lib/environment'
import { ethers } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import { FC, useEffect, useState } from 'react'
import { useWindowSize } from 'react-use'
import { YieldGate as YieldGateType } from 'types/typechain'
import { ClaimedEvent } from 'types/typechain/BeneficiaryPool'
import { useAccount, useProvider, useSigner } from 'wagmi'
import { BlockiesAvatar } from './BlockiesAvatar'
import ConnectWalletButton from './ConnectWalletButton'

function truncateHash(hash: string, length = 38): string {
  return hash.replace(hash.substring(6, length), '...')
}

export interface CreatorCardProps {
  creator: Creator
  isOwner: boolean
}
export const CreatorCard: FC<CreatorCardProps> = ({ creator, isOwner }) => {
  const { width, height } = useWindowSize()
  const [{ data, error, loading }, getSigner] = useSigner()
  const provider = useProvider()
  const [{ data: accountData }, disconnect] = useAccount()
  const YieldGateContractAddress = ContractAddresses['80001'].YieldGate
  const [stakeIsLoading, setStakeIsLoading] = useState(false)
  const [unstakeIsLoading, setUnstakeIsLoading] = useState(false)
  const [claimIsLoading, setClaimIsLoading] = useState(false)
  const toast = useToast()

  const [totalAmountStaked, setTotalAmountStaked] = useState(0.0)
  const readTotalStakedAmount = async () => {
    const provider = ethers.getDefaultProvider(env.rpc.polygonMumbai)
    const beneficiary = creator?.address
    if (!beneficiary) {
      setTotalAmountStaked(0)
      return
    }
    const contract = new ethers.Contract(
      YieldGateContractAddress,
      YieldGate.abi,
      provider
    ) as YieldGateType
    const value = await contract.staked(beneficiary)
    setTotalAmountStaked(parseFloat(formatEther(value) || '0'))
  }
  useEffect(() => {
    readTotalStakedAmount()
  }, [creator?.address])

  const [supporterStakedAmount, setSupporterStakedAmount] = useState(0.0)
  const readSupporterStakedAmount = async () => {
    const provider = ethers.getDefaultProvider(env.rpc.polygonMumbai)
    const supporter = accountData?.address
    const beneficiary = creator?.address
    if (!supporter || !beneficiary) {
      setSupporterStakedAmount(0)
      return
    }
    const contract = new ethers.Contract(
      YieldGateContractAddress,
      YieldGate.abi,
      provider
    ) as YieldGateType
    const value = await contract.supporterStaked(supporter, beneficiary)
    setSupporterStakedAmount(parseFloat(formatEther(value) || '0'))
  }
  useEffect(() => {
    readSupporterStakedAmount()
  }, [accountData?.address, creator?.address])

  const [claimableAmount, setClaimableAmount] = useState('0.0')
  const readClaimableAmount = async () => {
    const provider = ethers.getDefaultProvider(env.rpc.polygonMumbai)
    const beneficiary = creator?.address
    if (!beneficiary) {
      setClaimableAmount('0.0')
      return
    }
    const contract = new ethers.Contract(
      YieldGateContractAddress,
      YieldGate.abi,
      provider
    ) as YieldGateType
    const value = await contract.claimable(beneficiary)
    setClaimableAmount(ethers.utils.formatUnits(value, 'finney') || '0.0')
  }
  useEffect(() => {
    readClaimableAmount()
  }, [creator?.address, accountData?.address])

  const stake = async () => {
    // Blockchain Transaction
    const signer = await getSigner()
    if (!signer) return
    setStakeIsLoading(true)
    const contract = new ethers.Contract(
      YieldGateContractAddress,
      YieldGate.abi,
      signer
    ) as YieldGateType
    const beneficiary = creator?.address
    const transaction = await contract.stake(beneficiary, {
      value: ethers.utils.parseEther('0.1'),
      gasLimit: 2000000,
    })
    console.log({ transaction })
    const receipt = await transaction.wait()
    console.log({ receipt })

    // Database Transaction
    const res = await fetch('/api/supporters/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supporter: accountData?.address,
        beneficary: beneficiary,
      }),
    })
    const { isAdded } = await res.json()
    if (isAdded) creator.supportersCount++

    // Update UI
    await readTotalStakedAmount()
    await readSupporterStakedAmount()

    setStakeIsLoading(false)
  }

  const [yieldHasBeenClaimed, setYieldHasBeenClaimed] = useState(false)
  const claim = async () => {
    // Blockchain Transaction
    const signer = await getSigner()
    if (!signer) return
    const supporter = accountData?.address
    const beneficiary = creator?.address
    if (
      !supporter ||
      !beneficiary ||
      supporter.toLowerCase() !== beneficiary.toLowerCase()
    ) {
      return
    }
    setClaimIsLoading(true)
    const contract = new ethers.Contract(
      YieldGateContractAddress,
      YieldGate.abi,
      signer
    ) as YieldGateType
    const transaction = await contract.claim()
    console.log({ transaction })
    const result = await transaction.wait()
    console.log({ receipt: result })

    const claimedEvent1 = (result.events || []).filter(
      (e) => e.event === 'Claimed'
    )?.[0] as ClaimedEvent
    console.log({ claimedEvent1 })

    const claimedEvent2 = (result.events || []).filter(
      (e) => e.address === YieldGateContractAddress
    )?.[0] as ClaimedEvent
    console.log({ claimedEvent2 })

    // Update UI
    await readClaimableAmount()

    toast({
      title: 'Ammount claimed',
      description: `You've successfully claimed ${123.0} MATIC`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    })

    setClaimIsLoading(false)
    setYieldHasBeenClaimed(true)
  }

  const unstake = async () => {
    const signer = await getSigner()
    if (!signer) return
    const supporter = accountData?.address
    const beneficiary = creator?.address
    if (!supporter || !beneficiary) {
      return
    }
    setUnstakeIsLoading(true)
    const contract = new ethers.Contract(
      YieldGateContractAddress,
      YieldGate.abi,
      signer
    ) as YieldGateType
    const transaction = await contract.unstake(beneficiary)
    console.log({ transaction })
    const receipt = await transaction.wait()
    console.log({ receipt })

    // Database Transaction
    const res = await fetch('/api/supporters/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supporter: supporter,
        beneficary: beneficiary,
      }),
    })
    console.log({ res })
    const { isRemoved } = await res.json()
    if (isRemoved) creator.supportersCount--

    // Update UI
    await readTotalStakedAmount()
    await readSupporterStakedAmount()

    setUnstakeIsLoading(false)
  }

  if (!creator) return <></>

  return (
    <>
      <VStack spacing={8} borderRadius="md" border="1px" p={5}>
        <BlockiesAvatar
          address={creator?.address}
          borderRadius="full"
          width="200px"
          height="200px"
        />
        <VStack w="full">
          <Heading textAlign={'center'}>
            {creator.displayName || truncateHash(creator.address)}
          </Heading>
          <Text textAlign={'center'}>{creator?.description}</Text>
        </VStack>

        <VStack w="full">
          {accountData ? (
            <>
              {isOwner ? (
                <Button
                  w="full"
                  py={'7'}
                  colorScheme="whatsapp"
                  disabled={claimIsLoading}
                  onClick={claim}
                  isLoading={claimIsLoading}
                >
                  <VStack spacing={'1'}>
                    <Text>Claim</Text>
                    <Text fontSize={'xs'} opacity=".75">
                      {parseFloat(claimableAmount).toFixed(9)} mMATIC
                    </Text>
                  </VStack>
                </Button>
              ) : (
                <>
                  <Button
                    w="full"
                    disabled={stakeIsLoading || unstakeIsLoading}
                    onClick={stake}
                    isLoading={stakeIsLoading}
                  >
                    Stake
                  </Button>
                  {!!supporterStakedAmount && (
                    <Button
                      w="full"
                      py={'7'}
                      disabled={stakeIsLoading || unstakeIsLoading}
                      onClick={unstake}
                      isLoading={unstakeIsLoading}
                    >
                      <VStack spacing={'1'}>
                        <Text>Unstake</Text>
                        <Text fontSize={'xs'} color="gray.500">
                          You staked {supporterStakedAmount.toFixed(2)} MATIC
                        </Text>
                      </VStack>
                    </Button>
                  )}
                </>
              )}
            </>
          ) : (
            <ConnectWalletButton />
          )}
        </VStack>
        <HStack spacing={8} mx={8}>
          <Flex direction="column" align="center">
            <Heading>{creator?.supportersCount}</Heading>
            <Text>Supporters</Text>
          </Flex>
          <Flex direction="column" align="center">
            <Heading>{totalAmountStaked.toFixed(1)}</Heading>
            <Text>MATIC staked</Text>
          </Flex>
          <Flex direction="column" align="center">
            <Heading>{creator?.postsCount}</Heading>
            <Text>Posts</Text>
          </Flex>
        </HStack>
      </VStack>

      {/* Confetti after claim */}
      {yieldHasBeenClaimed && <Confetti />}
    </>
  )
}