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
      </div>
    </div>
  );
}
