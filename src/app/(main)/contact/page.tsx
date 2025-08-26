export default function Contact() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="bg-gray-200 p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-xl font-semibold mb-4"></h2>
        <div className="space-y-4">
          <p>
            <i className="fa-brands fa-telegram text-blue-500 mr-2"></i>
            <a href="https://t.me/izanoth" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Telegram: @izanoth
            </a>
          </p>
          <p>
            <i className="fa-brands fa-discord text-purple-500 mr-2"></i>
            <a href="https://discord.com/users/_zanoth_" className="text-purple-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Discord: _zanoth_
            </a>
          </p>
          <p>
            <i className="fa-solid fa-envelope mr-2"></i>
            <a href="mailto:ivanzanoth@gmail.com" className="text-red-600 hover:underline">
              ivanzanoth@gmail.com
            </a>
          </p>
        </div>
        <textarea className="bg-gray-200 p-8 rounded-lg" 
                  value="-----BEGIN PGP PUBLIC KEY BLOCK-----

                        mDMEZT59ahYJKwYBBAHaRw8BAQdAeYKsr7nBMVBhue/B9m/NjO+c4FWGNx5d0SpC
                        /jBPIvW0I2l2YW4gY2lsZW50byA8aXZhbnphbm90aEBnbWFpbC5jb20+iJAEExYI
                        ADgCGwMFCwkIBwIGFQoJCAsCBBYCAwECHgECF4AWIQTL31Irihp+M3VV4Un3aBIB
                        7L4wXwUCZ4OtogAKCRD3aBIB7L4wXxaYAQCHiM1VtWN75nRfpeE30ARmYRbX4QWT
                        mbfdEPgevnFKDQD/TiamBXlskbnZiT15dAtcM9EUYvSKZZZD9ZlWPrH12QW4OARl
                        Pn1qEgorBgEEAZdVAQUBAQdA49/Wgajh9+HwcyPWZMUpOa3yCWsbWOOz7v2wW++U
                        9lEDAQgHiHgEGBYIACACGwwWIQTL31Irihp+M3VV4Un3aBIB7L4wXwUCZ4OtuAAK
                        CRD3aBIB7L4wX1n8AP497NBMhqGIfM9I1J0Daf263FnNDBJLexUpe55/Vy9xtgD/
                        QAEWhK3j49B0QjSVQfIZX/c6c65klCBANDJEreGmHA+YMwRmjU5jFgkrBgEEAdpH
                        DwEBB0DyJPJigJk1/UnGWfZ8RWkYRMYB0j7yGW0tdl5ZXCKJzLQjSXZhbiBDaWxl
                        bnRvIDxpdmFuemFub3RoQGdtYWlsLmNvbT6IkAQTFggAOBYhBCQFkVnGhKVMX5q7
                        MXwivF3/3QR5BQJmjU5jAhsDBQsJCAcCBhUKCQgLAgQWAgMBAh4BAheAAAoJEHwi
                        vF3/3QR55Z0A/j9KKOuMNCj9zuYFnws4liI6mobZFd+wyla7AahBuMfYAP4h/Jei
                        HN/eKSDZeND14PRVplj3JdFuHXC1/tsmtyZdBrg4BGaNTmMSCisGAQQBl1UBBQEB
                        B0Bu3gpcyAFssWbVt30G1luMDBw9M2+BPAbs+flTsv/JNwMBCAeIeAQYFggAIBYh
                        BCQFkVnGhKVMX5q7MXwivF3/3QR5BQJmjU5jAhsMAAoJEHwivF3/3QR5HjAA/3ii
                        9rGOFvNmlSaFgJ2hV0ja77ZibdeIgOzctQOgUDuMAQCEjZfQoEfSypisXbNCkZfx
                        VfDbwRSvSEQealDX/1BOAQ==
                        =mN1y
                        -----END PGP PUBLIC KEY BLOCK-----
                        " 
        />
      </div>
    </div>
  );
}
