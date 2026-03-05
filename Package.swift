// swift-tools-version:5.7
import PackageDescription
let package = Package(
    name: "Zebra-iOS",
    platforms: [
        .iOS(.v16)
    ],
    products: [
        .library(
            name: "Zebra",
            targets: ["Zebra"]
        )
    ],
    targets: [
        .binaryTarget(
            name: "PvZebra",
            path: "lib/ios/PvZebra.xcframework"
        ),
        .target(
            name: "Zebra",
            dependencies: ["PvZebra"],
            path: ".",
            exclude: [
                "binding/ios/ZebraAppTest",
                "demo"
            ],
            sources: [
                "binding/ios/Zebra.swift",
                "binding/ios/ZebraErrors.swift"
            ]
        )
    ]
)
