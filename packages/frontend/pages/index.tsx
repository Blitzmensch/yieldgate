import {
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  Spacer,
  Text,
} from '@chakra-ui/react'
import { BlockiesAvatar } from '@components/BlockiesAvatar'
import Layout from '@components/layout/Layout'
import { Creator } from '@entities/Creator.entity'
import { env } from '@lib/environment'
import { GetServerSideProps } from 'next'
import NextLink from 'next/link'
import { BsSearch } from 'react-icons/bs'
import { useAccount } from 'wagmi'

export interface IndexPageProps {
  creators: Creator[]
}

function truncateHash(hash: string, length = 38): string {
  return hash.replace(hash.substring(6, length), '...')
}

function CreatorCard(props: Creator): JSX.Element {
  return (
    <NextLink href={`/users/${props.address}`} passHref>
      <Link _hover={{ textDecoration: 'none' }}>
        <Flex direction="column" border="1px" p={8} borderRadius="md">
          <Flex align="center">
            <BlockiesAvatar
              address={props.address}
              borderRadius="full"
              width="100px"
              height="100px"
            />
            <Flex direction="column" align="left" mx={8}>
              <Heading>
                {props.displayName || truncateHash(props.address)}
              </Heading>
              <Text>{props.description}</Text>
            </Flex>
            <Spacer />
            <HStack spacing="24px" mx={8}>
              <Flex direction="column" align="center">
                <Heading>{props.supportersCount}</Heading>
                <Text>Supporters</Text>
              </Flex>
              <Flex direction="column" align="center">
                <Heading>{props.postsCount}</Heading>
                <Text>Posts</Text>
              </Flex>
            </HStack>
          </Flex>
        </Flex>
      </Link>
    </NextLink>
  )
}

export default function IndexPage({ creators }: IndexPageProps) {
  const [{ data: accountData }] = useAccount()

  return (
    <Layout>
      <Flex
        bgImage="/images/banner-background.png"
        bgPos="center"
        bgSize="cover"
      >
        <Container maxW="5xl" py={24}>
          <Flex direction="column" align="start" gap={3}>
            <Image src="/images/logo-yieldgate-long.svg" h="70px" mb={2} />
            <Text fontSize="3xl" fontWeight={700}>
              Earn yield from your supporters.
              <br />
              Support your favourite projects and creators with yield.
            </Text>
            {accountData && (
              <NextLink href={`/users/${accountData.address}`} passHref>
                <Button size="lg" mt="6">
                  Create on Yieldgate
                </Button>
              </NextLink>
            )}
          </Flex>
        </Container>
      </Flex>
      <Container maxW="5xl">
        <Flex direction="column">
          <Heading mt={24} mb={12} textAlign="center">
            What's Yieldgate?
          </Heading>
          <Text
            maxW="30em"
            alignSelf="center"
            fontSize="2xl"
            textAlign="center"
          >
            Yieldgate is a tool to receive donations, or to support projects and
            creators, with yield. No NFTs or tokens, just good old MATIC!
          </Text>
        </Flex>
        <Flex direction="column">
          <Heading mt={24} mb={12} textAlign="center">
            How does it work?
          </Heading>
          <Grid gridTemplateColumns="repeat(3, 1fr)" gap={10}>
            <Flex
              direction="column"
              border="1px"
              borderRadius="md"
              overflow="hidden"
            >
              <Image src="/images/step-1.png" h={52} />
              <Text p={5} fontSize="xl">
                Sign in with your wallet
              </Text>
            </Flex>
            <Flex
              direction="column"
              border="1px"
              borderRadius="md"
              overflow="hidden"
            >
              <Image src="/images/step-2.png" h={52} />
              <Text p={5} fontSize="xl">
                Edit your profile and make your first post
              </Text>
            </Flex>
            <Flex
              direction="column"
              border="1px"
              borderRadius="md"
              overflow="hidden"
            >
              <Image src="/images/step-3.png" h={52} />
              <Text p={5} fontSize="xl">
                Share your Yieldgate profile to start receiving donations from
                your supporters in yield!
              </Text>
            </Flex>
          </Grid>
        </Flex>
        <Flex direction="column">
          <Heading mt={24} mb={12} textAlign="center">
            Explore and sponsor creators
          </Heading>
          <InputGroup size="lg">
            <InputLeftElement
              pointerEvents="none"
              children={<BsSearch size={20} />}
            />
            <Input placeholder="Find creator" />
          </InputGroup>
          <Flex direction="column" gap={8} py={8}>
            {creators.map((creator) => (
              <CreatorCard key={creator._id} {...creator} />
            ))}
          </Flex>
        </Flex>
        <Flex direction="column" mb={40}>
          <Heading mt={24} mb={24} textAlign="center">
            On the shoulders of giants
          </Heading>
          <Grid
            templateColumns="1fr 1fr"
            templateRows="100px 100px"
            gap="20"
            placeItems="center"
          >
            <Image src="/images/aave.svg" h="60%" />
            <Image src="/images/polygon.svg" h="70%" />
            <Image src="/images/walletconnect.svg" h="60%" />
            <Image src="/images/coinbase.svg" h="50%" />
          </Grid>
        </Flex>
      </Container>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const res = await fetch(`${env.url}/api/creators/getAllCreators`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const { creators }: { creators: Creator[] } = await res.json()

  return {
    props: {
      creators,
    } as IndexPageProps,
    // revalidate: 60,
  }
}
