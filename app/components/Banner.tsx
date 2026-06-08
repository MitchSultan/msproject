import React from 'react'

export default function Banner() {
  return (
    <div>
      <section className="bg-white lg:grid lg:max-h-screen lg:place-content-center">
  <div className="mx-auto w-screen max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
    <div className="max-w-prose text-left">
      <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
        Get Hydraulic calculations at your
        <strong className="text-indigo-600">Fingertips  </strong>
        
      </h1>

      <p className="mt-4 text-base text-pretty text-gray-700 sm:text-lg/relaxed">
       Managed Pressure Drilling (MPD) is revolutionizing the drilling industry by offering a more precise and controlled approach to managing wellbore pressures. This innovative technique is transforming how drilling operations are conducted, enhancing safety, efficiency, and cost-effectiveness.
      </p>

      <div className="mt-4 flex gap-4 sm:mt-6">
        <a className="inline-block rounded border border-indigo-600 bg-indigo-600 px-5 py-3 font-medium text-white shadow-sm transition-colors hover:bg-indigo-700" href="/well-design/create">
          Create Well
        </a>

        <a className="inline-block rounded border border-gray-200 px-5 py-3 font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900" href="/reports">
          Get Report
        </a>
      </div>
    </div>
  </div>
</section>
    </div>
  )
}
