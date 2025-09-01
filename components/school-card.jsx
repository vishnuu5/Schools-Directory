import Image from "next/image";

export default function SchoolCard({ school }) {
  const { name, address, city, image } = school;
  const imgSrc = image || "/school-image-placeholder.png";
  const altText = image ? `${name} image` : "School image placeholder";
  return (
    <div className="border rounded-lg overflow-hidden bg-white hover:shadow-md transition flex flex-col">
      <div className="relative w-full h-44 bg-gray-100">
        <Image
          src={imgSrc || "/placeholder.svg"}
          alt={altText}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <div className="p-4 flex flex-col gap-1">
        <h3 className="font-medium">{name}</h3>
        <p className="text-sm text-gray-600">{address}</p>
        <p className="text-sm text-gray-800">{city}</p>
      </div>
    </div>
  );
}
