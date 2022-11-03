import { Wrapper } from '@components/layout/Wrapper'
import { FC } from 'react'
import CountUp from 'react-countup'
import 'twin.macro'
import { HomeCTAs } from './HomeCTAs'
import { HomeHeroIllustration } from './HomeHeroIllustration'

export interface HomeHeroProps {}
export const HomeHero: FC<HomeHeroProps> = () => {
  return (
    <>
      <div tw="relative flex items-center overflow-hidden h-[60vh] min-h-[33rem] lg:h-[70vh]">
        {/* Text Content */}
        <Wrapper tw="z-10">
          <div tw="space-y-8 max-w-[22rem] pb-[2.5vh] sm:px-4 lg:(max-w-[30rem] pb-[5vh])">
            {/* Tagline */}
            <p tw="font-display font-bold text-4xl tracking-tight lg:text-5xl">
              Compounding yield to enable climate action at 0 cost
            </p>

            {/* Burned KPI */}
            <div tw="flex flex-col">
              <div tw="whitespace-nowrap font-display font-bold text-4xl leading-none min-h-[1em] lg:text-5xl">
                <CountUp end={238477} duration={2.5} separator="," decimals={0} />
              </div>
              <div tw="mt-2 text-sm opacity-75">carbon credits burned</div>
            </div>

            {/* CTAs */}
            <HomeCTAs primaryFirst={true} tw="text-base" />
          </div>
        </Wrapper>

        {/* Illustration BG */}
        <HomeHeroIllustration />
      </div>
    </>
  )
}
