'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function DashboardBody() {
  const [investmentAmount, setInvestmentAmount] = useState('')
  const [calculatedReturn, setCalculatedReturn] = useState(0)

  const calculateReturn = () => {
    const amount = parseFloat(investmentAmount)
    if (isNaN(amount)) return
    
    // Calculate daily return (30% of investment)
    const dailyReturn = amount * 0.3
    setCalculatedReturn(dailyReturn)
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen mb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/deposit" className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-center">
            <div className="text-blue-600 dark:text-blue-400 mb-1">
              <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Deposit</span>
          </Link>
          <Link href="/withdraw" className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-center">
            <div className="text-blue-600 dark:text-blue-400 mb-1">
              <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Withdraw</span>
          </Link>
          <Link href="/group" className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-center">
            <div className="text-blue-600 dark:text-blue-400 mb-1">
              <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Group</span>
          </Link>
          <Link href="/contact" className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-center">
            <div className="text-blue-600 dark:text-blue-400 mb-1">
              <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Contact Us</span>
          </Link>
        </div>

        {/* Investment Plan Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Investment Plan Details */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              PUREHEALTH Investment Plan
            </h2>
            
            {/* Image Placeholder */}
            <div className="mb-6 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 h-60 w-full flex flex-col items-center justify-center">
              <div className="relative h-60 w-full">
                <Image
                  src="/home.jpeg"
                  alt="PUREHEALTH Project"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Plan Details</h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Welcome Bonus:</span>
                    <span className="font-medium dark:text-gray-100">₦900</span>
                  </li>
                  <li className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Plan Duration:</span>
                    <span className="font-medium dark:text-gray-100">30 Days</span>
                  </li>
                  <li className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Payment Window:</span>
                    <span className="font-medium dark:text-gray-100">10AM - 5pm Daily</span>
                  </li>
                  <li className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Withdrawal Fee:</span>
                    <span className="font-medium dark:text-gray-100">10%</span>
                  </li>
                  <li className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Referral Bonus:</span>
                    <span className="font-medium dark:text-gray-100">30% (Direct) + 3% (Indirect)</span>
                  </li>
                  <li className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Minimum Withdrawal:</span>
                    <span className="font-medium dark:text-gray-100">₦1,000</span>
                  </li>
                  <li className="flex justify-between py-2">
                    <span className="text-gray-500 dark:text-gray-400">Withdrawal Frequency:</span>
                    <span className="font-medium dark:text-gray-100">Daily</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Investment Tiers</h3>
                <div className="overflow-auto max-h-80">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Investment</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Daily Return</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {[
                        { investment: '₦3,000', return: '₦900' },
                        { investment: '₦6,000', return: '₦1,800' },
                        { investment: '₦20,000', return: '₦6,000' },
                        { investment: '₦50,000', return: '₦15,000' },
                        { investment: '₦100,000', return: '₦30,000' },
                        { investment: '₦150,000', return: '₦45,000' },
                        { investment: '₦200,000', return: '₦60,000' },
                        { investment: '₦250,000', return: '₦75,000' },
                        { investment: '₦350,000', return: '₦95,000' },
                        { investment: '₦650,000', return: '₦180,000' },
                        { investment: '₦1,000,000', return: '₦300,000' },
                        { investment: '₦2,000,000', return: '₦600,000' },
                      ].map((tier, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                          <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900 dark:text-gray-100">{tier.investment}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-green-600 dark:text-green-400">{tier.return}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Investment Calculator */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Investment Calculator
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="investment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Investment Amount (₦)
                </label>
                <input
                  type="number"
                  id="investment"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. 10000"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                />
              </div>

              <button
                onClick={calculateReturn}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Calculate Returns
              </button>

              {calculatedReturn > 0 && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-md border border-blue-100 dark:border-blue-800">
                  <h3 className="text-lg font-medium text-blue-800 dark:text-blue-400 mb-2">Projected Returns</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Daily Return:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">₦{calculatedReturn.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Weekly (7 days):</span>
                      <span className="font-medium text-green-600 dark:text-green-400">₦{(calculatedReturn * 7).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Monthly (30 days):</span>
                      <span className="font-medium text-green-600 dark:text-green-400">₦{(calculatedReturn * 30).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile App Section */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Mobile App</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Download our mobile app for easier access to your investments:</p>
              <div className="flex space-x-3">
                <button className="flex items-center justify-center bg-black dark:bg-gray-700 text-white dark:text-gray-100 px-3 py-2 rounded-md text-sm">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.1 12.6v-1.8c0-.1 0-.2.1-.2.1 0 .1.1.1.2v1.8c0 .1 0 .2-.1.2-.1 0-.1-.1-.1-.2zm0 0v-1.8c0-.1 0-.2.1-.2.1 0 .1.1.1.2v1.8c0 .1 0 .2-.1.2-.1 0-.1-.1-.1-.2zm-4.3-1.8c0-.1 0-.2.1-.2.1 0 .1.1.1.2v1.8c0 .1 0 .2-.1.2-.1 0-.1-.1-.1-.2v-1.8zm2.2 0c0-.1 0-.2.1-.2.1 0 .1.1.1.2v1.8c0 .1 0 .2-.1.2-.1 0-.1-.1-.1-.2v-1.8zm2.2 0c0-.1 0-.2.1-.2.1 0 .1.1.1.2v1.8c0 .1 0 .2-.1.2-.1 0-.1-.1-.1-.2v-1.8zM12.9 3c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" />
                  </svg>
                  App Store
                </button>
                <button className="flex items-center justify-center bg-black dark:bg-gray-700 text-white dark:text-gray-100 px-3 py-2 rounded-md text-sm">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3.9 12c0-1.7 1.4-3.1 3.1-3.1h4V7H7c-2.8 0-5 2.2-5 5s2.2 5 5 5h4v-1.9H7c-1.7 0-3.1-1.4-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.7 0 3.1 1.4 3.1 3.1s-1.4 3.1-3.1 3.1h-4V17h4c2.8 0 5-2.2 5-5s-2.2-5-5-5z" />
                  </svg>
                  Google Play
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}