import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { AaveAddresses } from '../shared/aaveAddresses'
import { getDeployer } from '../shared/deploy'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const deployer = await getDeployer(hre)
  console.log(`Deploying as ${deployer}…`)

  const aave = AaveAddresses[hre.network.name]
  if (!aave) {
    throw new Error(`No Aave addresses for network ${hre.network.name}`)
  }

  const { deploy } = hre.deployments
  console.log(`Deploying YieldGate(${aave.pool}, ${aave.wETHGateway}, ${aave.nativeAToken})…`)
  await deploy('YieldGate', {
    from: deployer,
    args: [aave.pool, aave.wETHGateway, aave.nativeAToken],
    log: true,
  })
}
func.tags = ['YieldGate']
export default func
